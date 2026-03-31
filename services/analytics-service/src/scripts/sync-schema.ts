import { createClient } from '@clickhouse/client';
import fs from 'fs';
import path from 'path';

/**
 * We strip any database name from the URI to ensure we connect to 'default'.
 * This prevents "Database analytics does not exist" errors during the first run.
 */
const rawUri = process.env.CLICKHOUSE_URI || 'http://clickhouse-srv:8123';
const baseUri = rawUri.replace(/\/+$/, '').split('/').slice(0, 3).join('/');

const client = createClient({
  url: baseUri,
  database: 'default',
});

export async function syncSchema() {
  const folderPath = path.join(__dirname, '../clickHouseTables');
  
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Folder not found: ${folderPath}`);
    return;
  }

  // 1. Read and sort all .sql files (01, 02, etc.)
  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`--- Starting ClickHouse Cluster Sync (${files.length} files) ---`);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const fullSql = fs.readFileSync(filePath, 'utf8');

    /**
     * Split by semicolon and remove comments.
     * ClickHouse HTTP API does not support multi-statement queries.
     */
    const queries = fullSql
      .split(';')
      .map(q => q.replace(/--.*$/gm, '').trim())
      .filter(q => q.length > 0);

    console.log(`\nProcessing: ${file} (${queries.length} queries)...`);

    for (const query of queries) {
      try {
        await client.command({
          query: query,
          clickhouse_settings: {
            /**
             * distributed_ddl_task_timeout: Gives the cluster 2 minutes to sync.
             * wait_end_of_query: Forces the script to wait until the table is 
             * actually materialized and visible on all nodes.
             */
            distributed_ddl_task_timeout: '120',
            wait_end_of_query: 1, 
          },
        });
        
        console.log(`   ✅ Executed: ${query.substring(0, 45).replace(/\n/g, ' ')}...`);
        
        // Small delay to allow ZooKeeper/Keeper metadata to settle 
        // before the next dependent table is created.
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err: any) {
        console.error(`\n❌ Error in ${file} during query execution.`);
        console.error(`Query: [${query.substring(0, 100)}...]`);
        console.error(`Reason: ${err.message}`);
        process.exit(1);
      }
    }
    console.log(`✅ ${file} applied successfully.`);
  }

  console.log('\n--- ClickHouse Cluster is Synchronized! ---');
  await client.close();
}