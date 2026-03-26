import Redis from 'ioredis';

const nodesString = process.env.REDIS_NODES || '';


const startupNodes = nodesString.split(',').map(node => {
  const [host, port] = node.split(':');
  return { host, port: parseInt(port) };
});

// 3. Initialize the Cluster Client
export const redisClient = new Redis.Cluster(startupNodes, {
  redisOptions: {
    showFriendlyErrorStack: true,
  },
});
 
redisClient.on('connect', () => console.log('✅ Connected to Redis Cluster'));