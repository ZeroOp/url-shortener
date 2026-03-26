import { redisClient } from '../redis-client';

// Mock the Redis Cluster client
jest.mock('../redisClient', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  },
}));

jest.mock('../cassandra-wrapper', () => ({
  cassandraWrapper: {
    connect: jest.fn().mockResolvedValue(null),
    client: {
      execute: jest.fn(),
      getState: jest.fn().mockReturnValue({
        getConnectedHosts: jest.fn().mockReturnValue([])
      })
    }
  }
}));
