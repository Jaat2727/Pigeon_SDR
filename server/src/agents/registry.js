export const AGENT_REGISTRY = [
  { id: 'system', display: 'System Prompt' },
  { id: 'research', display: 'Research Agent' },
  { id: 'icp_fitment', display: 'ICP Agent' },
  { id: 'outreach_strategy', display: 'Strategy Agent' },
  { id: 'personalisation', display: 'Personalisation Agent' },
  { id: 'conversation', display: 'Conversation Agent' }
];

export const getAgentDisplay = (id) => {
  const agent = AGENT_REGISTRY.find(a => a.id === id);
  return agent ? agent.display : id;
};

export const getAgentId = (display) => {
  const agent = AGENT_REGISTRY.find(a => a.display === display);
  return agent ? agent.id : display;
};
