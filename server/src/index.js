import express from 'express';
import cors from 'cors';
import { env } from './config.js';

import healthRoutes from './routes/health.js';
import controlRoutes from './routes/control.js';
import campaignsRoutes from './routes/campaigns.js';
import prospectsRoutes from './routes/prospects.js';
import promptsRoutes from './routes/prompts.js';
import escalationsRoutes from './routes/escalations.js';
import conflictsRoutes from './routes/conflicts.js';
import costsRoutes from './routes/costs.js';
import metricsRoutes from './routes/metrics.js';
import activityRoutes from './routes/activity.js';
import agentsRoutes from './routes/agents.js';
import repsRoutes from './routes/reps.js';
import suppressionRoutes from './routes/suppression.js';

const app = express();

app.use(cors({
  origin: [
    'https://buildathon-pink-seven.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));

app.use(express.json());

// Mount routes
app.use('/health', healthRoutes);
app.use('/control', controlRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/prospects', prospectsRoutes);
app.use('/prompts', promptsRoutes);
app.use('/escalations', escalationsRoutes);
app.use('/conflicts', conflictsRoutes);
app.use('/costs', costsRoutes);
app.use('/reps', repsRoutes);
app.use('/suppression', suppressionRoutes);

// New global routes (added for v2 redesign)
app.use('/metrics', metricsRoutes);
app.use('/activity', activityRoutes);
app.use('/agents', agentsRoutes);
// /attention alias reads from the same escalations table
app.use('/attention', escalationsRoutes);

const PORT = env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
