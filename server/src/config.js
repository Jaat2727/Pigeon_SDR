import dotenv from 'dotenv';
dotenv.config({ path: '../.env' }); // load from root if run locally

export const env = {
  PORT: process.env.PORT || 3001,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  DRONAHQ_API_KEY: process.env.DRONAHQ_API_KEY,
  DRONAHQ_RESEARCH_URL: process.env.DRONAHQ_RESEARCH_URL,
  DRONAHQ_ICP_URL: process.env.DRONAHQ_ICP_URL,
  DRONAHQ_STRATEGY_URL: process.env.DRONAHQ_STRATEGY_URL,
  DRONAHQ_PERSONALISATION_URL: process.env.DRONAHQ_PERSONALISATION_URL,
  DRONAHQ_CONVERSATION_URL: process.env.DRONAHQ_CONVERSATION_URL,
};
