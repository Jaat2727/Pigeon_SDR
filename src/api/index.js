/**
 * API Index — unified export.
 * When VITE_API_BASE_URL is set, calls go through axios to the real backend.
 * When unset, calls go to the in-memory mock.
 */
import { apiClient, isUsingMockApi } from './client.js';
import { mockApi } from './mock.js';

async function withFallback(method, url, data, mockFn) {
  if (isUsingMockApi) return mockFn();
  try {
    return await apiClient({ method, url, data }).then(r => r.data);
  } catch (err) {
    console.warn(`Backend error on ${method} ${url}, falling back to mock:`, err.message);
    return mockFn();
  }
}

const api = {
  // ── Campaigns ──
  getCampaigns: () =>
    withFallback('get', '/campaigns', null, () => mockApi.getCampaigns()),

  createCampaign: (data) =>
    withFallback('post', '/campaigns', data, () => mockApi.createCampaign(data)),

  getCampaign: (id) =>
    withFallback('get', `/campaigns/${id}`, null, () => mockApi.getCampaign(id)),

  updateCampaign: (id, data) =>
    withFallback('patch', `/campaigns/${id}`, data, () => mockApi.updateCampaign(id, data)),

  setCampaignStatus: (id, status) =>
    withFallback('post', `/campaigns/${id}/status`, { status }, () => mockApi.setCampaignStatus(id, status)),

  duplicateCampaign: (id) =>
    withFallback('post', `/campaigns/${id}/duplicate`, null, () => mockApi.duplicateCampaign(id)),

  getCampaignMetrics: (id) =>
    withFallback('get', `/campaigns/${id}/metrics`, null, () => mockApi.getCampaignMetrics(id)),

  getGlobalMetrics: () =>
    withFallback('get', '/metrics/global', null, () => mockApi.getGlobalMetrics()),

  getCampaignActivity: (id) =>
    withFallback('get', `/campaigns/${id}/activity`, null, () => mockApi.getCampaignActivity(id)),

  getAllActivity: () =>
    withFallback('get', '/activity', null, () => mockApi.getAllActivity()),

  getCampaignProspects: (id) =>
    withFallback('get', `/campaigns/${id}/prospects`, null, () => mockApi.getCampaignProspects(id)),

  // ── Prospects ──
  getProspect: (id) =>
    withFallback('get', `/prospects/${id}`, null, () => mockApi.getProspect(id)),

  getAllProspects: () =>
    withFallback('get', '/prospects', null, () => mockApi.getAllProspects()),

  // ── Prompts ──
  getCampaignPrompts: (campaignId) =>
    withFallback('get', `/campaigns/${campaignId}/prompts`, null, () => mockApi.getCampaignPrompts(campaignId)),

  createPromptVersion: (campaignId, data) =>
    withFallback('post', `/campaigns/${campaignId}/prompts`, data, () => mockApi.createPromptVersion(campaignId, data)),

  activatePrompt: (promptId) =>
    withFallback('post', `/prompts/${promptId}/activate`, null, () => mockApi.activatePrompt(promptId)),

  // ── Escalations ──
  getEscalations: () =>
    withFallback('get', '/escalations', null, () => mockApi.getEscalations()),

  resolveEscalation: (id, action) =>
    withFallback('post', `/escalations/${id}/resolve`, { action }, () => mockApi.resolveEscalation(id, action)),

  // ── Conflicts ──
  getConflicts: () =>
    withFallback('get', '/conflicts', null, () => mockApi.getConflicts()),

  resolveConflict: (id, campaignId) =>
    withFallback('post', `/conflicts/${id}/resolve`, { campaign_id: campaignId }, () => mockApi.resolveConflict(id, campaignId)),

  // ── System Control ──
  getSystemControl: () =>
    withFallback('get', '/control', null, () => mockApi.getSystemControl()),

  toggleKillSwitch: (engaged) =>
    withFallback('post', '/control/kill', { enabled: engaged }, () => mockApi.toggleKillSwitch(engaged)),

  setChannelPause: (channel, paused) =>
    withFallback('post', '/control/channel', { channel, paused }, () => mockApi.setChannelPause(channel, paused)),

  setAgentPause: (agentKey, paused) =>
    withFallback('post', '/control/agent', { agent: agentKey, paused }, () => mockApi.setAgentPause(agentKey, paused)),

  // ── Costs ──
  getCosts: () =>
    withFallback('get', '/costs', null, () => mockApi.getCosts()),

  // ── Agent Runs ──
  getAgentRuns: (campaignId) =>
    withFallback('get', `/campaigns/${campaignId}/agents`, null, () => mockApi.getAgentRuns(campaignId)),

  getGlobalAgents: () =>
    withFallback('get', '/agents', null, () => mockApi.getGlobalAgents()),

  // ── Needs Attention ──
  getNeedsAttention: () =>
    withFallback('get', '/attention', null, () => mockApi.getNeedsAttention()),

  // ── Reps ──
  getReps: () =>
    withFallback('get', '/reps', null, () => mockApi.getReps()),

  getSuppression: () =>
    withFallback('get', '/suppression', null, () => mockApi.getSuppression()),
};

export default api;
