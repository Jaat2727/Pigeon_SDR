import { supabase } from '../db/client.js';

export async function isActionAllowed(campaign_id, prospect_id, channel) {
  // 1. Global kill switch & pauses
  const { data: sysData, error: sysErr } = await supabase
    .from('system_control')
    .select('kill_switch, channel_pauses, agent_pauses')
    .limit(1)
    .single();

  if (sysErr && sysErr.code !== 'PGRST116') {
    console.error('Gate: error fetching system_control', sysErr);
    return { allowed: false, reason: 'system_error' };
  }

  if (sysData) {
    if (sysData.kill_switch) {
      return { allowed: false, reason: 'kill_switch_active' };
    }
    if (channel && sysData.channel_pauses?.[channel]) {
      return { allowed: false, reason: `channel_paused_${channel}` };
    }
  }

  // 2. Campaign status and channels
  const { data: campaign, error: campErr } = await supabase
    .from('campaigns')
    .select('status, enabled_channels, channels, daily_limit')
    .eq('id', campaign_id)
    .single();

  if (campErr) {
    console.error('Gate: error fetching campaign', campErr);
    return { allowed: false, reason: 'campaign_error' };
  }

  if (campaign.status !== 'live') {
    return { allowed: false, reason: 'campaign_paused' };
  }

  const enabledChannels = campaign.enabled_channels?.length > 0 ? campaign.enabled_channels : (campaign.channels || []);
  if (channel && !enabledChannels.includes(channel)) {
    return { allowed: false, reason: `channel_disabled_${channel}` };
  }

  // 3. Suppression list
  if (prospect_id) {
    const { data: prospect, error: prosErr } = await supabase
      .from('prospects')
      .select('email, company_domain, phone')
      .eq('id', prospect_id)
      .single();
      
    if (prosErr) {
      console.error('Gate: error fetching prospect', prosErr);
      return { allowed: false, reason: 'prospect_error' };
    }

    const { data: suppression } = await supabase
      .from('suppression_list')
      .select('id')
      .or(`email.eq.${prospect.email},domain.eq.${prospect.company_domain},phone.eq.${prospect.phone}`)
      .limit(1);

    if (suppression && suppression.length > 0) {
      return { allowed: false, reason: 'suppressed' };
    }
  }

  // 4. Daily limits
  const startOfDay = new Date();
  startOfDay.setUTCHours(0,0,0,0);
  
  const { count: dailyCount } = await supabase
    .from('agent_runs')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaign_id)
    .gte('created_at', startOfDay.toISOString());

  const limit = campaign.daily_limit || 50;
  if (dailyCount >= limit) {
    return { allowed: false, reason: 'daily_limit_reached' };
  }

  return { allowed: true };
}
