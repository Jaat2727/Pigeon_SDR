/**
 * API Index — unified export.
 * When VITE_API_BASE_URL is set, calls go through axios to the real backend.
 * When unset, calls go to the in-memory mock.
 *
 * To switch: set VITE_API_BASE_URL in your .env file.
 */
import { apiClient, isUsingMockApi } from './client.js';
import { mockApi } from './mock.js';

function realApi(method, url, data) {
  return apiClient({ method, url, data }).then(r => r.data);
}

const api = {
  // ── Campaigns ──
  getCampaigns: () =>
    isUsingMockApi ? mockApi.getCampaigns() : realApi('get', '/campaigns'),

  createCampaign: (data) =>
    isUsingMockApi ? mockApi.createCampaign(data) : realApi('post', '/campaigns', data),

  getCampaign: (id) =>
    isUsingMockApi ? mockApi.getCampaign(id) : realApi('get', `/campaigns/${id}`),

  updateCampaign: (id, data) =>
    isUsingMockApi ? mockApi.updateCampaign(id, data) : realApi('patch', `/campaigns/${id}`, data),

  setCampaignStatus: (id, status) =>
    isUsingMockApi ? mockApi.setCampaignStatus(id, status) : realApi('post', `/campaigns/${id}/status`, { status }),

  duplicateCampaign: (id) =>
    isUsingMockApi ? mockApi.duplicateCampaign(id) : realApi('post', `/campaigns/${id}/duplicate`),

  getCampaignMetrics: (id) =>
    isUsingMockApi ? mockApi.getCampaignMetrics(id) : realApi('get', `/campaigns/${id}/metrics`),

  getCampaignActivity: (id) =>
    isUsingMockApi ? mockApi.getCampaignActivity(id) : realApi('get', `/campaigns/${id}/activity`),

  getCampaignProspects: (id) =>
    isUsingMockApi ? mockApi.getCampaignProspects(id) : realApi('get', `/campaigns/${id}/prospects`),

  // ── Prospects ──
  getProspect: (id) =>
    isUsingMockApi ? mockApi.getProspect(id) : realApi('get', `/prospects/${id}`),

  getAllProspects: () =>
    isUsingMockApi ? mockApi.getAllProspects() : realApi('get', '/prospects'),

  // ── Prompts ──
  getCampaignPrompts: (campaignId) =>
    isUsingMockApi ? mockApi.getCampaignPrompts(campaignId) : realApi('get', `/campaigns/${campaignId}/prompts`),

  createPromptVersion: (campaignId, data) =>
    isUsingMockApi ? mockApi.createPromptVersion(campaignId, data) : realApi('post', `/campaigns/${campaignId}/prompts`, data),

  activatePrompt: (promptId) =>
    isUsingMockApi ? mockApi.activatePrompt(promptId) : realApi('post', `/prompts/${promptId}/activate`),

  // ── Conflicts ──
  getConflicts: () =>
    isUsingMockApi ? mockApi.getConflicts() : realApi('get', '/conflicts'),

  resolveConflict: (id, campaignId) =>
    isUsingMockApi ? mockApi.resolveConflict(id, campaignId) : realApi('post', `/conflicts/${id}/resolve`, { campaign_id: campaignId }),

  // ── System Control ──
  getSystemControl: () =>
    isUsingMockApi ? mockApi.getSystemControl() : realApi('get', '/control'),

  toggleKillSwitch: (engaged) =>
    isUsingMockApi ? mockApi.toggleKillSwitch(engaged) : realApi('post', '/control/kill', { engaged }),

  setChannelPause: (channel, paused) =>
    isUsingMockApi ? mockApi.setChannelPause(channel, paused) : realApi('post', '/control/channel', { channel, paused }),

  // ── Costs ──
  getCosts: () =>
    isUsingMockApi ? mockApi.getCosts() : realApi('get', '/costs'),

  // ── Agent Runs ──
  getAgentRuns: (campaignId) =>
    isUsingMockApi ? mockApi.getAgentRuns(campaignId) : realApi('get', `/campaigns/${campaignId}/agents`),

  // ── Reps ──
  getReps: () =>
    isUsingMockApi ? mockApi.getReps() : realApi('get', '/reps'),

  getSuppression: () =>
    isUsingMockApi ? mockApi.getSuppression() : realApi('get', '/suppression'),
};

export default api;
