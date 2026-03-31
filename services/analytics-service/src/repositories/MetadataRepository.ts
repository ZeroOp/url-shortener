import { ClickHouseClient } from '@clickhouse/client';

export interface UrlMetadata {
  shortUrl: string;
  longUrl: string;
  userId: string;
  status: 'active' | 'expired' | 'deleted';
  version: number; // Critical for ReplacingMergeTree
  updated_at: string;
}

export class MetadataRepository {
  constructor(private client: ClickHouseClient) {}

  /**
   * Upserts metadata. Higher version replaces lower version rows.
   */
  async upsert(data: UrlMetadata) {
    await this.client.insert({
      table: 'url_metadata',
      values: [data],
      format: 'JSONEachRow',
    });
  }

  /**
   * Uses FINAL to ensure we get the latest version before a background merge.
   */
  async getLatest(shortUrl: string) {
    const rs = await this.client.query({
      query: `SELECT * FROM url_metadata FINAL WHERE shortUrl = {url:String} LIMIT 1`,
      query_params: { url: shortUrl },
      format: 'JSONEachRow',
    });
    const rows = await rs.json<UrlMetadata>();
    return rows[0] || null;
  }
}