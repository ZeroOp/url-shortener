import { app } from './app';
import { clickhouseWrapper } from './clickhouse-wrapper';
import { UrlClickedListner } from './events/link-clicked-listener';
import { UrlCreatedListener } from './events/url-created-listener';
import { UrlDeletedListener } from './events/url-deleted-listener';
import { UrlExpiredListener } from './events/url-expired-listener';
import { natsWrapper } from './nats-wrapper';
import { syncSchema } from './scripts/sync-schema';

/**
 * Helper to handle NATS connection with a retry strategy.
 * Useful for K8s environments where NATS might start after the service.
 */
const connectWithRetry = async (retries = 5, delay = 5000): Promise<void> => {
  while (retries > 0) {
    try {
      await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID!,
        process.env.NATS_CLIENT_ID!,
        process.env.NATS_URL!
      );

      // Setup Graceful Shutdown Listeners
      natsWrapper.client.on('close', () => {
        console.log('[nats] Connection closed! Exiting process...');
        process.exit();
      });

      process.on('SIGINT', () => natsWrapper.client.close());
      process.on('SIGTERM', () => natsWrapper.client.close());

      console.log('[nats] Connected successfully');
      return;
    } catch (err) {
      retries -= 1;
      console.error(`[nats] Connection failed. Retries remaining: ${retries}`);
      
      if (retries === 0) {
        console.error('[nats] Fatal: Could not connect to NATS after multiple attempts.');
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

const start = async () => {
  console.log('[analytics] Starting service...');

  // 1. Env Checks
  const requiredEnv = ['CLICKHOUSE_URI', 'JWT_KEY', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID'];
  requiredEnv.forEach((env) => {
    if (!process.env[env]) throw new Error(`${env} must be defined`);
  });

  // 2. Connect to Databases & Messaging
  try {
    // ClickHouse Connection
    await clickhouseWrapper.connect(process.env.CLICKHOUSE_URI!);
    console.log('[analytics] ClickHouse Connected');

    await syncSchema();
    // NATS Connection (using our externalized method)
    await connectWithRetry();
  } catch (err) {
    console.error('[analytics] Initialization failed:', err);
    process.exit(1);
  }

  // 3. Initialize Domain Listeners
  new UrlCreatedListener(natsWrapper.client).listen();
  new UrlDeletedListener(natsWrapper.client).listen();
  new UrlExpiredListener(natsWrapper.client).listen();
  new UrlClickedListner(natsWrapper.client).listen();
  console.log('[analytics] Listeners initialized');

  // 4. Start HTTP Server
  app.listen(3000, () => {
    console.log('[analytics] Service running on port 3000');
  });
};

start();