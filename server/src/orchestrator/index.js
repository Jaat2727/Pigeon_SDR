import { supabase } from '../db/client.js';
import { callAgent } from '../agents/client.js';
import { isActionAllowed } from './gate.js';

/**
 * Orchestrator pipeline logic.
 * Triggered by the worker for new/progressing prospects.
 */
export async function advance(campaign_id, prospect_id, previousOutput = null) {
  // 1. Fetch the prospect and its state
  const { data: cp, error: cpErr } = await supabase
    .from('campaign_prospects')
    .select('*, campaigns(*), prospects(*)')
    .eq('campaign_id', campaign_id)
    .eq('prospect_id', prospect_id)
    .single();

  if (cpErr || !cp) {
    console.error(`advance() failed: Prospect not found`, cpErr);
    return;
  }

  // 2. Guards using gate.js
  const gate = await isActionAllowed(campaign_id, prospect_id, null);
  if (!gate.allowed) {
    console.log(`Orchestrator paused: ${gate.reason}`);
    return;
  }

  // 3. State Machine mapping to determine next action
  let nextAgent = null;
  let payload = {};

  if (cp.state === 'discovered') {
    if (cp.prospects.enriched_data && Object.keys(cp.prospects.enriched_data).length > 0) {
      console.log(`advance(): Prospect ${prospect_id} already enriched, skipping research.`);
      await supabase.from('campaign_prospects')
        .update({ state: 'researched' })
        .eq('campaign_id', campaign_id)
        .eq('prospect_id', prospect_id);
      return advance(campaign_id, prospect_id, previousOutput);
    }
    
    nextAgent = 'research';
    payload = {
      prospect: { stub: cp.prospects },
      campaign: { research_focus: cp.campaigns?.research_focus || '' }
    };
  } else if (cp.state === 'researched') {
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
        icp_result: cp.icp_result || previousOutput || {},
        contact_history: []
      },
      campaign: {
        outreach_policy: cp.campaigns?.outreach_policy || '',
        enabled_channels: cp.campaigns?.enabled_channels?.length > 0 ? cp.campaigns.enabled_channels : (cp.campaigns?.channels || [])
      }
    };
  } else if (cp.state === 'strategy_planned') {
    nextAgent = 'personalisation';
    const channels = cp.campaigns?.enabled_channels?.length > 0 ? cp.campaigns.enabled_channels : (cp.campaigns?.channels || []);
    
    const channelGate = await isActionAllowed(campaign_id, prospect_id, channels[0] || 'email');
    if (!channelGate.allowed) {
      console.log(`Orchestrator paused for channel: ${channelGate.reason}`);
      return;
    }
    
    // Fetch knowledge chunks
    const { data: chunks } = await supabase.from('knowledge_chunks').select('*').eq('campaign_id', campaign_id);
    
    payload = {
      prospect: {
        enriched_profile: cp.prospects.enriched_data || cp.prospects,
        thread_history: []
      },
      outreach: {
        current_step: cp.outreach_plan ? cp.outreach_plan[cp.current_step] || {} : {}
      },
      campaign: {
        messaging_policy: cp.campaigns?.messaging_policy || ''
      },
      retrieved_knowledge: chunks || [],
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
    console.log(`No next action for prospect ${prospect_id} in state ${cp.state}`);
    return;
  }

  // 4. Duplicate Run Prevention (except for personalisation which can run multiple times for steps)
  if (nextAgent !== 'personalisation') {
    const { data: existingRuns } = await supabase.from('agent_runs')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('prospect_id', prospect_id)
      .eq('agent_name', nextAgent)
      .eq('status', 'success');
    
    if (existingRuns && existingRuns.length > 0) {
      console.log(`advance(): Prospect already has a completed ${nextAgent} run, skipping to prevent duplicates.`);
      return;
    }
  }

  // 5. Fetch Prompt Version ID
  let prompt_version_id = null;
  const { data: prompt } = await supabase.from('prompt_versions')
    .select('id, content')
    .eq('campaign_id', campaign_id)
    .eq('agent_name', nextAgent)
    .eq('is_active', true)
    .single();
    
  if (prompt) {
    prompt_version_id = prompt.id;
    payload.prompt_instructions = prompt.content;
  }

  // 6. Fire agent synchronously
  try {
    const result = await callAgent(nextAgent, payload, { 
      campaign_id, 
      prospect_id, 
      prompt_version_id 
    });
    
    if (result.success && result.parsedOutput) {
      let nextState = cp.state;
      let updates = {};

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
            phone: flat.phone,
            tenure_months: flat.tenure_months,
            recent_activity: flat.recent_activity,
          },
          company: {
            name: flat.company_name,
            domain: flat.company_domain,
            industry: flat.company_industry,
            employee_count: flat.company_employee_count,
            funding_stage: flat.company_funding_stage,
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
        await supabase.from('prospects').update({ enriched_data: nestedEnriched, enriched_at: new Date().toISOString() }).eq('id', prospect_id);
      }
      else if (nextAgent === 'icp_fitment') {
        const v = result.parsedOutput.verdict;
        if (v === 'qualify') nextState = 'qualified';
        else if (v === 'reject') nextState = 'rejected';
        else nextState = 'needs_review';
        updates.icp_result = result.parsedOutput;
        updates.icp_verdict = v;
        updates.icp_confidence = result.parsedOutput.confidence;
        updates.fit_score = result.parsedOutput.fit_score;
      }
      else if (nextAgent === 'outreach_strategy') {
        nextState = 'strategy_planned';
        updates.outreach_plan = result.parsedOutput.sequence;
        updates.current_step = 0;
      }
      else if (nextAgent === 'personalisation') {
        nextState = 'contacted';
        
        // Write message
        await supabase.from('messages').insert({
          campaign_id,
          prospect_id,
          campaign_prospect_id: cp.id,
          direction: 'outbound',
          channel: result.parsedOutput.channel,
          step_number: cp.current_step,
          subject: result.parsedOutput.subject,
          body: result.parsedOutput.body,
          personalisation_used: result.parsedOutput.personalisation_used,
          knowledge_used: result.parsedOutput.knowledge_used,
          cta: result.parsedOutput.cta,
          needs_human: result.parsedOutput.needs_human,
          needs_human_reason: result.parsedOutput.needs_human_reason,
          prompt_version_id
        });
        
        // Record activity
        await supabase.from('activities').insert({
          campaign_id,
          prospect_id,
          agent_name: 'personalisation',
          action: `Sent ${result.parsedOutput.channel} message`,
          status: 'completed',
          metadata: { step: cp.current_step, subject: result.parsedOutput.subject }
        });
      }
      else if (nextAgent === 'conversation') {
         const intent = result.parsedOutput.intent;
         if (['interested', 'meeting_request'].includes(intent)) nextState = 'opportunity';
         else if (['not_now', 'not_interested', 'opt_out'].includes(intent)) nextState = 'rejected';
         else nextState = 'replied'; 
      }

      updates.state = nextState;
      updates.last_touch_at = new Date().toISOString();
      updates.next_action_at = new Date(Date.now() + 86400000).toISOString();
      
      await supabase.from('campaign_prospects')
        .update(updates)
        .eq('campaign_id', campaign_id)
        .eq('prospect_id', prospect_id);
    }
  } catch (err) {
    console.error(`advance() failed to run agent ${nextAgent}:`, err);
  }
}
