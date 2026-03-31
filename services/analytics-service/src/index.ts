import { createClient } from '@clickhouse/client';
import { app } from "./app";

// 1. Initialize the ClickHouse Client
// Using 'url' instead of 'host' to avoid deprecation warnings
// We point to the Service name: clickhouse-srv
const client = createClient({
  url: process.env.CLICKHOUSE_URI || 'http://clickhouse-srv:8123',
  // The username and database are usually parsed from the URI, 
  // but we can explicitly set 'default' here to ensure it hits the right spot.
  database: 'default', 
});

/**
 * Simple function to verify the Node.js -> ClickHouse bridge.
 * This inserts a single row into the ReplicatedMergeTree table.
 */
async function testClickHouse(): Promise<void> {
  console.log("Testing ClickHouse connection...");
  try {
    await client.insert({
      table: 'rep_test',
      values: [
        { id: 500, message: 'Inserted from Node.js Analytics Service' }
      ],
      format: 'JSONEachRow',
    });
    await client.insert({
        table: 'rep_test',
        values: [
          { id: 600, message: 'Inserted from Node.js Analytics Service' }
        ],
        format: 'JSONEachRow',
      });
    console.log("✅ SUCCESS: Record 999 inserted into ClickHouse!");
  } catch (err: any) {
    console.error("❌ ClickHouse Insert Failed:", err.message);
    // Log the full error if it's not a database missing error
    if (err.code !== '81') {
      console.error(err);
    }
  }
}

// 2. Start the Express server
const start = async () => {
  app.listen(3000, async () => {
    console.log("Analytics Service is running on port 3000");

    // Run the test write immediately on startup
    await testClickHouse();
  });
};

start();