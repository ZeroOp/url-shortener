import { createClient, ClickHouseClient } from '@clickhouse/client';
import { MetadataRepository } from './repositories/MetadataRepository';
import { StatsRepository } from './repositories/StatsRepository';
import { ClicksRepository } from './repositories/ClickRespository';

class ClickHouseWrapper {
  private _client?: ClickHouseClient;
  private _clicks?: ClicksRepository;
  private _metadata?: MetadataRepository;
  private _stats?: StatsRepository;

  // Getters to access repositories globally
  get clicks() {
    if (!this._clicks) throw new Error('ClickHouse not initialized');
    return this._clicks;
  }

  get metadata() {
    if (!this._metadata) throw new Error('ClickHouse not initialized');
    return this._metadata;
  }

  get stats() {
    if (!this._stats) throw new Error('ClickHouse not initialized');
    return this._stats;
  }

  /**
   * Connects the client and prepares the repositories.
   * Call this in your index.ts start() function.
   */
  async connect(url: string) {
    this._client = createClient({
      url,
      database: 'analytics',
    });

    // Inject the client into the repositories
    this._clicks = new ClicksRepository(this._client);
    this._metadata = new MetadataRepository(this._client);
    this._stats = new StatsRepository(this._client);

    console.log('✅ ClickHouse Wrapper & Repositories Initialized');
  }

  get client() {
    if (!this._client) throw new Error('ClickHouse client not initialized');
    return this._client;
  }
}

export const clickhouseWrapper = new ClickHouseWrapper();