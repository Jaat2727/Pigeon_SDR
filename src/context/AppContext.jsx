/**
 * AppContext — Global state provider.
 * Manages: kill switch, system control, campaigns list, conflicts count.
 * All children can read and mutate these via useApp().
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/index.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // System control
  const [systemControl, setSystemControl] = useState({
    kill_switch: false,
    channel_pauses: { email: false, linkedin: false, sms: false, voice: false },
  });

  // Campaigns
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);

  // Conflicts
  const [conflictsCount, setConflictsCount] = useState(0);

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

  // Initial load
  useEffect(() => {
    loadSystemControl();
    loadCampaigns();
    loadConflicts();
  }, [loadSystemControl, loadCampaigns, loadConflicts]);

  // ── Actions ──
  const toggleKillSwitch = useCallback(async (engaged) => {
    try {
      const data = await api.toggleKillSwitch(engaged);
      setSystemControl(data);
      // Refresh campaigns since kill switch changes their status
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

  const setCampaignStatus = useCallback(async (id, status) => {
    try {
      await api.setCampaignStatus(id, status);
      await loadCampaigns();
    } catch (err) {
      console.error('Failed to set campaign status:', err);
      throw err;
    }
  }, [loadCampaigns]);

  // Derived
  const liveCampaignCount = campaigns.filter(c => c.status === 'live').length;
  const isKilled = systemControl.kill_switch;

  const value = {
    // System
    systemControl,
    isKilled,
    toggleKillSwitch,
    setChannelPause,
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
