import { ClickHouseClient } from '@clickhouse/client';

export interface UrlMetadata {
  shortUrl: string;
  longUrl: string;
  userId: string;
  status: 'active' | 'expired' | 'deleted';
  version: number; 
  updated_at: string;
}

export class MetadataRepository {
  constructor(private client: ClickHouseClient) {}

  async upsert(data: UrlMetadata) {
    await this.client.insert({
      table: 'analytics.url_metadata',
      values: [data],
      format: 'JSONEachRow',
    });
  }

  async getLatest(shortUrl: string) {
    const rs = await this.client.query({
      query: `SELECT * FROM analytics.url_metadata FINAL WHERE shortUrl = {url:String} LIMIT 1`,
      query_params: { url: shortUrl },
      format: 'JSONEachRow',
    });
    const rows = await rs.json<UrlMetadata>();
    return rows[0] || null;
  }

  async getUserSummary(userId: string) {
    const rs = await this.client.query({
      query: `
        SELECT 
          count() as totalLinks,
          countIf(status = 'active') as activeLinks,
          countIf(status = 'expired') as expiredLinks
        FROM analytics.url_metadata FINAL
        WHERE userId = {uid:String}
      `,
      query_params: { uid: userId },
      format: 'JSONEachRow',
    });
    const rows = await rs.json<any>();
    const data = rows[0] || { totalLinks: 0, activeLinks: 0, expiredLinks: 0 };
    
    // Explicitly cast to numbers for the frontend
    return {
        totalLinks: Number(data.totalLinks),
        activeLinks: Number(data.activeLinks),
        expiredLinks: Number(data.expiredLinks)
    };
  }
}