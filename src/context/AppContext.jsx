/**
 * AppContext — Global state provider for Pigeon SDR Command Center.
 * Manages: kill switch, system control, campaigns, conflicts,
 * escalations, prospects, daily costs, global metrics, needs-attention items.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // System control
  const [systemControl, setSystemControl] = useState({
    kill_switch: false,
    channel_pauses: { email: false, linkedin: false, sms: false, voice: false },
    agent_pauses: {},
  });

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);

  // Conflicts & Escalations
  const [conflictsCount, setConflictsCount] = useState(0);
  const [escalationsCount, setEscalationsCount] = useState(0);

  // Prospects
  const [prospectsCount, setProspectsCount] = useState(0);

  // Daily costs / system stats
  const [dailyCosts, setDailyCosts] = useState({ total_spend: 0, avg_latency_ms: 0, total_runs: 0 });

  // Global metrics (for dashboard)
  const [globalMetrics, setGlobalMetrics] = useState({
    live_campaigns: 0,
    total_campaigns: 0,
    active_prospects: 0,
    total_prospects: 0,
    meetings_booked: 0,
    pipeline_value: 0,
    agent_success_rate: 0,
    pending_approvals: 0,
    conflicts: 0,
  });

  // Needs Attention
  const [needsAttention, setNeedsAttention] = useState({ items: [], summary: {} });

  // ── Loaders ──
  const loadSystemControl = useCallback(async () => {
    try {
      const data = await api.getSystemControl();
      setSystemControl(data);
    } catch (err) {
      console.error('Failed to load system control:', err);
    }
  }, []);

  const loadCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setCampaignsError(err.message || 'Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  const loadConflicts = useCallback(async () => {
    try {
      const data = await api.getConflicts();
      setConflictsCount(data.length);
    } catch (err) {
      console.error('Failed to load conflicts:', err);
    }
  }, []);

  const loadEscalations = useCallback(async () => {
    try {
      const data = await api.getEscalations();
      setEscalationsCount(data.length);
    } catch (err) {
      console.error('Failed to load escalations:', err);
    }
  }, []);

  const loadProspectsCount = useCallback(async () => {
    try {
      const data = await api.getAllProspects();
      setProspectsCount(data.length);
    } catch (err) {
      console.error('Failed to load prospects count:', err);
    }
  }, []);

  const loadDailyCosts = useCallback(async () => {
    try {
      const data = await api.getCosts();
      setDailyCosts(data);
    } catch (err) {
      console.error('Failed to load daily costs:', err);
    }
  }, []);

  const loadGlobalMetrics = useCallback(async () => {
    try {
      const data = await api.getGlobalMetrics();
      setGlobalMetrics(data);
    } catch (err) {
      console.error('Failed to load global metrics:', err);
    }
  }, []);

  const loadNeedsAttention = useCallback(async () => {
    try {
      const data = await api.getNeedsAttention();
      setNeedsAttention(data);
    } catch (err) {
      console.error('Failed to load needs attention:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSystemControl();
    loadCampaigns();
    loadConflicts();
    loadEscalations();
    loadProspectsCount();
    loadDailyCosts();
    loadGlobalMetrics();
    loadNeedsAttention();
  }, [
    loadSystemControl, loadCampaigns, loadConflicts, loadEscalations,
    loadProspectsCount, loadDailyCosts, loadGlobalMetrics, loadNeedsAttention,
  ]);

  // ── Actions ──
  const toggleKillSwitch = useCallback(async (engaged) => {
    try {
      const data = await api.toggleKillSwitch(engaged);
      setSystemControl(data);
      await loadCampaigns();
    } catch (err) {
      console.error('Failed to toggle kill switch:', err);
      throw err;
    }
  }, [loadCampaigns]);

  const setChannelPause = useCallback(async (channel, paused) => {
    try {
      const data = await api.setChannelPause(channel, paused);
      setSystemControl(data);
    } catch (err) {
      console.error('Failed to set channel pause:', err);
      throw err;
    }
  }, []);

  const setAgentPause = useCallback(async (agentKey, paused) => {
    try {
      const data = await api.setAgentPause(agentKey, paused);
      setSystemControl(data);
    } catch (err) {
      console.error('Failed to set agent pause:', err);
      throw err;
    }
  }, []);

  const setCampaignStatus = useCallback(async (id, status) => {
    try {
      await api.setCampaignStatus(id, status);
      await loadCampaigns();
      await loadGlobalMetrics();
    } catch (err) {
      console.error('Failed to set campaign status:', err);
      throw err;
    }
  }, [loadCampaigns, loadGlobalMetrics]);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Derived
  const liveCampaignCount = campaigns.filter(c => c.status === 'live').length;
  const isKilled = systemControl.kill_switch;

  const value = {
    // System
    systemControl,
    isKilled,
    toggleKillSwitch,
    setChannelPause,
    setAgentPause,
    loadSystemControl,

    // Campaigns
    campaigns,
    campaignsLoading,
    campaignsError,
    liveCampaignCount,
    setCampaignStatus,
    loadCampaigns,

    // Conflicts
    conflictsCount,
    loadConflicts,

    // Escalations
    escalationsCount,
    loadEscalations,

    // Prospects
    prospectsCount,

    // Daily costs
    dailyCosts,

    // Global metrics
    globalMetrics,
    loadGlobalMetrics,

    // Needs Attention
    needsAttention,
    loadNeedsAttention,

    // Toasts
    toasts,
    addToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
