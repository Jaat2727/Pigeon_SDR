import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    total_spend: 142.50,
    by_campaign: []
  });
});

export default router;
