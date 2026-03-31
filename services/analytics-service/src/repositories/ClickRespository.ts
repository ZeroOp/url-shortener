import { ClickHouseClient } from '@clickhouse/client';

export interface ClickEvent {
  shortUrl: string;
  ip: string;
  userAgent: string;
  // Use string here because ClickHouse expects ISO-8601 strings for DateTime64
  timestamp: string; 
  // Optional: Add geo-data if your SQL schema includes them
  country?: string;
  city?: string;
}

export class ClicksRepository {
  constructor(private client: ClickHouseClient) {}

  /**
   * Now strictly typed to ClickEvent[]
   */
  async insertBatch(values: ClickEvent[]) {
    return this.client.insert({
      table: 'link_clicks',
      values,
      format: 'JSONEachRow',
    });
  }

  /**
 * Gets distribution of devices (Mobile vs Desktop) for a specific link.
 */
async getDeviceStats(shortUrl: string) {
  const rs = await this.client.query({
    query: `
      SELECT 
        CASE 
          WHEN userAgent LIKE '%Mobile%' THEN 'Mobile'
          WHEN userAgent LIKE '%Tablet%' THEN 'Tablet'
          ELSE 'Desktop'
        END as device,
        count() as count
      FROM link_clicks
      WHERE shortUrl = {url:String}
      GROUP BY device
    `,
    query_params: { url: shortUrl },
    format: 'JSONEachRow',
  });
  return await rs.json<{ device: string, count: string }>();
}

/**
 * Gets geographical distribution (by Country).
 */
async getGeoStats(shortUrl: string) {
  const rs = await this.client.query({
    query: `
      SELECT 
        country, 
        count() as count 
      FROM link_clicks 
      WHERE shortUrl = {url:String} 
      GROUP BY country 
      ORDER BY count DESC
    `,
    query_params: { url: shortUrl },
    format: 'JSONEachRow',
  });
  return await rs.json<{ country: string, count: string }>();
}

}