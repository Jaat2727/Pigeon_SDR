import { z } from 'zod';
import { supabase } from '../db/client.js';

// --- Zod Schemas ---

const agent1Schema = z.object({
  fit_score: z.number().min(0).max(100),
  verdict: z.enum(['qualify', 'reject', 'needs_review']),
  confidence: z.enum(['high', 'medium', 'low']),
  reasoning: z.string(),
  disqualifiers: z.array(z.string()).default([]),
  missing_data: z.array(z.string()).default([])
});

const agent2Schema = z.object({
  prospect_id: z.string().optional(),
  full_name: z.string().nullable(),
  title: z.string().nullable(),
  seniority: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  timezone: z.string().nullable(),
  linkedin_url: z.string().nullable(),
  email: z.string().nullable(),
  email_status: z.string().nullable(),
  phone: z.string().nullable(),
  phone_type: z.string().nullable(),
  tenure_months: z.number().nullable(),
  recent_activity: z.string().nullable(),
  company_name: z.string().nullable(),
  company_domain: z.string().nullable(),
  company_industry: z.string().nullable(),
  company_sub_industry: z.string().nullable(),
  company_employee_count: z.number().nullable(),
  company_hq_location: z.string().nullable(),
  company_funding_stage: z.string().nullable(),
  company_last_funding_date: z.string().nullable(),
  company_description: z.string().nullable(),
  tech_stack: z.array(z.string()).nullable(),
  hiring_roles: z.array(z.string()).nullable(),
  recent_news: z.string().nullable(),
  intent_signals: z.array(z.string()).nullable(),
  research_notes: z.string().nullable(),
  confidence: z.string().nullable(),
  fields_not_found: z.array(z.string()).default([])
});

const agent3Schema = z.object({
  should_contact: z.boolean(),
  no_contact_reason: z.string().nullable(),
  priority: z.string(),
  sequence_json: z.string(),
  stop_conditions: z.array(z.string()).default([]),
  escalate_to_human: z.boolean(),
  escalation_reason: z.string().nullable(),
  reasoning: z.string()
});

const agent4Schema = z.object({
  channel: z.string(),
  subject: z.string().nullable(),
  body: z.string(),
  word_count: z.number(),
  personalisation_used_json: z.string().nullable(),
  knowledge_used_json: z.string().nullable(),
  cta: z.string(),
  needs_human: z.boolean(),
  needs_human_reason: z.string().nullable(),
  reasoning: z.string()
});

const agent5Schema = z.object({
  is_human_reply: z.boolean(),
  intent: z.enum(['interested', 'meeting_request', 'question', 'objection', 'not_now', 'not_interested', 'opt_out', 'referral', 'wrong_person', 'auto_reply', 'bounce', 'unclear']),
  intent_confidence: z.number(),
  sentiment: z.string(),
  extracted_facts_json: z.string().nullable(),
  questions_asked: z.array(z.string()).default([]),
  objections_raised: z.array(z.string()).default([]),
  referral_name: z.string().nullable(),
  referral_contact: z.string().nullable(),
  recommended_action: z.string(),
  followup_delay_days: z.number().nullable(),
  requires_human: z.boolean(),
  escalation_reason: z.string().nullable(),
  reasoning: z.string()
});

const schemas = {
  icp_fitment: agent1Schema,
  research: agent2Schema,
  outreach_strategy: agent3Schema,
  personalisation: agent4Schema,
  conversation: agent5Schema
};

const getAgentUrlAndKey = (agentName) => {
  const mapping = {
    research: {
      url: process.env.DRONAHQ_RESEARCH_URL,
      key: process.env.DRONAHQ_RESEARCH_KEY
    },
    icp_fitment: {
      url: process.env.DRONAHQ_ICP_URL,
      key: process.env.DRONAHQ_ICP_KEY
    },
    outreach_strategy: {
      url: process.env.DRONAHQ_STRATEGY_URL,
      key: process.env.DRONAHQ_STRATEGY_KEY
    },
    personalisation: {
      url: process.env.DRONAHQ_PERSONALISATION_URL,
      key: process.env.DRONAHQ_PERSONALISATION_KEY
    },
    conversation: {
      url: process.env.DRONAHQ_CONVERSATION_URL,
      key: process.env.DRONAHQ_CONVERSATION_KEY
    }
  };
  return mapping[agentName];
};

function tryParseJSON(rawStr) {
  if (typeof rawStr !== 'string') return rawStr;
  try {
    return JSON.parse(rawStr);
  } catch (e) {
    // Strip ```json or bare ``` fences
    let match = rawStr.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e2) {}
    }
    // Fall back to first {...} block
    match = rawStr.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e3) {}
    }
    throw e;
  }
}

/**
 * Fires the DronaHQ webhook synchronously, validates output, and saves to DB.
 */
export async function callAgent(agentName, payload, meta = {}, retries = 1) {
  const config = getAgentUrlAndKey(agentName);
  const schema = schemas[agentName];
  if (!config || !schema) throw new Error(`Unknown agent: ${agentName}`);

  const startMs = Date.now();
  const body = { ...payload, _error_feedback: meta.errorFeedback };

  let rawOutput = '';
  let parsedOutput = null;
  let status = 'success';
  let validationError = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const res = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.key
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`DronaHQ API error: ${res.status} ${await res.text()}`);
    }

    const data = await res.json();
    
    // Hard-fail loudly if the agent is still configured fire-and-forget.
    if (data && data.run_id && data.thread_id && data.response === undefined) {
      throw new Error(
        `DRONAHQ_ASYNC_ACK: agent "${agentName}" returned a background-run ` +
        `acknowledgement, not output. Fix in DronaHQ: open this agent's ` +
        `Webhook trigger, Step 7 Configure Response, set it to "Standard" and ` +
        `paste the output JSON Schema. No code change will fix this.`
      );
    }

    if (!data.success && data.error) {
      throw new Error(`Agent failed. Response: ${JSON.stringify(data)}`);
    }

    // The useful payload may sit in any of these. Try in order.
    const raw = data?.response ?? data?.output ?? data?.result ?? data?.data ?? data;
    rawOutput = raw;
    
    const parsed = typeof raw === 'string' ? tryParseJSON(raw) : raw;
    const validated = schema.safeParse(parsed);
    
    if (!validated.success) {
      throw validated.error;
    }
    parsedOutput = validated.data;

    // Un-stringify arrays and nested objects for downstream usage
    if (parsedOutput.sequence_json) {
      try { parsedOutput.sequence = JSON.parse(parsedOutput.sequence_json); } catch(e) { parsedOutput.sequence = []; }
      delete parsedOutput.sequence_json;
    }
    if (parsedOutput.personalisation_used_json) {
      try { parsedOutput.personalisation_used = JSON.parse(parsedOutput.personalisation_used_json); } catch(e) { parsedOutput.personalisation_used = []; }
      delete parsedOutput.personalisation_used_json;
    }
    if (parsedOutput.knowledge_used_json) {
      try { parsedOutput.knowledge_used = JSON.parse(parsedOutput.knowledge_used_json); } catch(e) { parsedOutput.knowledge_used = []; }
      delete parsedOutput.knowledge_used_json;
    }
    if (parsedOutput.extracted_facts_json) {
      try { parsedOutput.extracted_facts = JSON.parse(parsedOutput.extracted_facts_json); } catch(e) { parsedOutput.extracted_facts = []; }
      delete parsedOutput.extracted_facts_json;
    }
    if (parsedOutput.referral_name || parsedOutput.referral_contact) {
      parsedOutput.referral = {
        name: parsedOutput.referral_name,
        contact: parsedOutput.referral_contact
      };
      delete parsedOutput.referral_name;
      delete parsedOutput.referral_contact;
    }

  } catch (error) {
    validationError = error.message;
    status = 'error';
    parsedOutput = { _degraded: true, error: validationError, raw: rawOutput };
  }

  // Retry once on error
  if (status === 'error' && retries > 0 && !validationError?.includes('DRONAHQ_ASYNC_ACK')) {
    console.log(`[${agentName}] Attempt failed, retrying... Error: ${validationError}`);
    return callAgent(agentName, payload, { ...meta, errorFeedback: `Previous attempt failed: ${validationError}` }, retries - 1);
  }

  const latencyMs = Date.now() - startMs;

  if (meta.prospect_id) {
    const { error: dbError } = await supabase.from('agent_runs').insert({
      campaign_id: meta.campaign_id || null,
      prospect_id: meta.prospect_id,
      prompt_version_id: meta.prompt_version_id || null,
      agent_name: agentName,
      input_payload: payload,
      output_payload: parsedOutput,
      status,
      latency_ms: latencyMs
    });
    if (dbError) console.error('Failed to write agent_run:', dbError.message);
  }

  return { success: status === 'success', parsedOutput, rawOutput, latencyMs };
}
