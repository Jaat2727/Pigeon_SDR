import { supabase } from '../db/client.js';
import { callAgentAsync } from '../agents/client.js';

/**
 * Orchestrator pipeline logic.
 * Triggered by the worker for new/progressing prospects, or by the callback when an agent finishes.
 */
export async function advance(campaign_id, prospect_id, previousOutput = null) {
  // 1. Fetch the prospect and its state
  const { data: cpData, error: cpErr } = await supabase
    .from('campaign_prospects')
    .select('*, campaigns(*), prospects(*)')
    .eq('campaign_id', campaign_id)
    .eq('prospect_id', prospect_id)
    .single();

  if (cpErr || !cpData) {
    console.error(`advance() failed: Prospect not found`, cpErr);
    return;
  }

  const cp = cpData;

  // 2. Guards
  // Check global kill switch
  const { data: systemControl } = await supabase.from('system_control').select('*').single();
  if (systemControl && systemControl.kill_switch_active) {
    console.log('Orchestrator paused: global kill switch active');
    return;
  }
  // Check campaign status
  if (cp.campaigns?.status === 'paused' || cp.campaigns?.status === 'draft') {
    console.log(`Orchestrator paused: campaign ${campaign_id} is ${cp.campaigns?.status}`);
    return;
  }
  // Check pending calls
  if (cp.pending_agent_call) {
    console.log(`advance() skipped: Prospect already has a pending call for ${cp.pending_agent_call}`);
    return;
  }

  // Check global rate limit
  const maxCalls = parseInt(process.env.MAX_AGENT_CALLS_PER_DAY || '20', 10);
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count: runsToday, error: countErr } = await supabase
    .from('agent_runs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString());

  if (countErr) {
    console.error('Failed to check rate limit:', countErr);
    return;
  }
  if (runsToday >= maxCalls) {
    console.warn(`Worker refuses: daily agent call limit reached (${runsToday}/${maxCalls})`);
    return;
  }

  // 3. State Machine mapping to determine next action
  let nextAgent = null;
  let payload = {};

  if (cp.state === 'discovered') {
    if (cp.prospects.enriched_data && Object.keys(cp.prospects.enriched_data).length > 0) {
      console.log(`advance(): Prospect ${prospect_id} already enriched, skipping research.`);
      
      // Update state locally and in DB, then recurse
      const { error: stateErr } = await supabase.from('campaign_prospects')
        .update({ state: 'researched' })
        .eq('campaign_id', campaign_id)
        .eq('prospect_id', prospect_id);
        
      if (stateErr) {
        console.error('Failed to update state for enrichment cache:', stateErr);
        return;
      }
      return advance(campaign_id, prospect_id, previousOutput);
    }
    
    nextAgent = 'research';
    payload = {
      prospect: { stub: cp.prospects },
      campaign: { research_focus: cp.campaigns?.research_focus || '' }
    };
  } else if (cp.state === 'researched') {
    // We assume the previous output (from research) updated the prospect, 
    // but we'll fetch latest prospect data
    nextAgent = 'icp_fitment';
    payload = {
      prospect: { enriched_profile: cp.prospects.enriched_data || cp.prospects },
      campaign: {
        icp_criteria: cp.campaigns?.icp_criteria || '',
        exclusion_criteria: cp.campaigns?.exclusion_criteria || '',
        sample_profiles: []
      }
    };
  } else if (cp.state === 'qualified') {
    nextAgent = 'outreach_strategy';
    payload = {
      prospect: {
        enriched_profile: cp.prospects.enriched_data || cp.prospects,
        icp_result: cp.icp_result || previousOutput, // Use previousOutput if just qualified
        contact_history: []
      },
      campaign: {
        outreach_policy: cp.campaigns?.outreach_policy || '',
        enabled_channels: cp.campaigns?.enabled_channels || []
      }
    };
  } else if (cp.state === 'strategy_planned') {
    // Next step is to actually send via personalisation
    nextAgent = 'personalisation';
    payload = {
      prospect: {
        enriched_profile: cp.prospects.enriched_data || cp.prospects,
        thread_history: []
      },
      outreach: {
        current_step: cp.next_outreach_step || {}
      },
      campaign: {
        messaging_policy: cp.campaigns?.messaging_policy || ''
      },
      retrieved_knowledge: [],
      rep: { identity: 'System' }
    };
  } else if (cp.state === 'replied') {
    nextAgent = 'conversation';
    payload = {
      inbound: { message: cp.latest_reply || '', channel: 'email' },
      prospect: {
        thread_history: [],
        enriched_profile: cp.prospects.enriched_data || cp.prospects
      },
      campaign: { objective_and_policy: cp.campaigns?.messaging_policy || '' }
    };
  } else {
    // Terminal state or unknown
    console.log(`No next action for prospect ${prospect_id} in state ${cp.state}`);
    return;
  }

  // 4. Duplicate Run Prevention
  const { data: existingRuns, error: dupErr } = await supabase.from('agent_runs')
    .select('id')
    .eq('campaign_id', campaign_id)
    .eq('prospect_id', prospect_id)
    .eq('agent_name', nextAgent)
    .eq('status', 'success');
  
  if (dupErr) {
    console.error('Failed to check for duplicate runs:', dupErr);
    return;
  }
  if (existingRuns && existingRuns.length > 0) {
    console.log(`advance(): Prospect ${prospect_id} already has a completed ${nextAgent} run, skipping to prevent duplicates.`);
    return;
  }

  // 5. Fire agent
  try {
    const result = await callAgent(nextAgent, payload, { 
      campaign_id, 
      prospect_id, 
      prompt_version_id: cp.campaigns?.active_prompt_version_id 
    });
    
    if (result.success && result.parsedOutput) {
      // Determine next state
      let nextState = cp.state;
      if (nextAgent === 'research') {
        nextState = 'researched';
        const flat = result.parsedOutput;
        const nestedEnriched = {
          person: {
            full_name: flat.full_name,
            title: flat.title,
            seniority: flat.seniority,
            department: flat.department,
            location: flat.location,
            timezone: flat.timezone,
            linkedin_url: flat.linkedin_url,
            email: flat.email,
            email_status: flat.email_status,
            phone: flat.phone,
            phone_type: flat.phone_type,
            tenure_months: flat.tenure_months,
            recent_activity: flat.recent_activity,
            previous_companies: []
          },
          company: {
            name: flat.company_name,
            domain: flat.company_domain,
            industry: flat.company_industry,
            sub_industry: flat.company_sub_industry,
            employee_count: flat.company_employee_count,
            hq_location: flat.company_hq_location,
            funding_stage: flat.company_funding_stage,
            last_funding_date: flat.company_last_funding_date,
            description: flat.company_description
          },
          signals: {
            tech_stack: flat.tech_stack || [],
            hiring_roles: flat.hiring_roles || [],
            recent_news: flat.recent_news,
            intent_signals: flat.intent_signals || []
          },
          research_notes: flat.research_notes,
          confidence: flat.confidence,
          fields_not_found: flat.fields_not_found || []
        };
        await supabase.from('prospects').update({ enriched_data: nestedEnriched }).eq('id', prospect_id);
      }
      else if (nextAgent === 'icp_fitment') {
        const v = result.parsedOutput.verdict;
        if (v === 'qualify') nextState = 'qualified';
        else if (v === 'reject') nextState = 'rejected';
        else nextState = 'needs_review';
      }
      else if (nextAgent === 'outreach_strategy') nextState = 'strategy_planned';
      else if (nextAgent === 'personalisation') nextState = 'contacted';
      else if (nextAgent === 'conversation') {
         // This depends on the output of conversation agent, maybe meeting_booked, replied, etc.
         nextState = 'replied'; // Keep it or map it further based on intent
      }

      // Update state
      if (nextState !== cp.state) {
        await supabase.from('campaign_prospects')
          .update({ state: nextState, last_touch_at: new Date().toISOString() })
          .eq('campaign_id', campaign_id)
          .eq('prospect_id', prospect_id);
      }
      
      // We could optionally recurse to fire the next agent immediately, but we will let the worker pick it up 
      // on the next tick to pace API calls naturally.
    }
  } catch (err) {
    console.error(`advance() failed to start agent ${nextAgent}:`, err);
  }
}
