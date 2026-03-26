import { redisClient } from '../redis-client';

// Mock the Redis Cluster client
jest.mock('../redisClient', () => ({
    redisClient: {
      get: jest.fn(),
      set: jest.fn(),
      ping: jest.fn().mockResolvedValue('PONG'),
    },
  }));