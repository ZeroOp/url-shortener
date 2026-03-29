import express from 'express';
import { json } from 'body-parser';
import { createClient } from 'redis';

const app = express();
app.use(json());

const redis = createClient({
  url: 'redis://counter-redis-srv:6379'
});

const JUMP_SIZE = 1000;

const connectWithRetry = async () => {
  console.log('Attempting to connect to Counter-Redis...');
  
  try {
    await redis.connect();
    console.log('Connected to Counter-Redis successfully!');

    // --- Safety Jump on Startup ---
    const current = await redis.get('global_id_counter');
    const lastKnownId = current ? parseInt(current) : 0;
    const safeStart = lastKnownId + JUMP_SIZE;
    
    await redis.set('global_id_counter', safeStart);
    console.log(`Initial Setup: Counter jumped from ${lastKnownId} to ${safeStart}`);

    setupEndpoints();
  } catch (err) {
    console.error('Redis connection failed. Retrying in 5 seconds...', err);
    // Wait 5 seconds before trying again
    setTimeout(connectWithRetry, 5000);
  }
};

const setupEndpoints = () => {
  app.post('/api/id-gen/next-range', async (req, res) => {
    try {
      const BATCH_SIZE = 3000;
      // Atomic increment
      const newUpperLimit = await redis.incrBy('global_id_counter', BATCH_SIZE);
      
      res.status(200).send({
        start: newUpperLimit - BATCH_SIZE + 1,
        end: newUpperLimit
      });
    } catch (error) {
      console.error('Error generating ID range:', error);
      res.status(500).send({ error: 'Failed to generate ID range' });
    }
  });

  app.listen(3000, () => {
    console.log('ID-Gen Service listening on port 3000');
  });
};

connectWithRetry();