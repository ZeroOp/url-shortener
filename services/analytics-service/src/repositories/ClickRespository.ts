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

/**
 * 1. HIGH RESOLUTION: Per-Minute (Best for last 1-2 hours)
 */
async getMinuteTimeSeries(shortUrl: string, hoursLimit: number = 2) {
  const rs = await this.client.query({
    query: `
      SELECT 
        toStartOfMinute(timestamp) as time_bucket, 
        count() as count
      FROM link_clicks
      WHERE shortUrl = {url:String}
        AND timestamp >= subtractHours(now(), {limit:UInt16})
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `,
    query_params: { url: shortUrl, limit: hoursLimit },
    format: 'JSONEachRow',
  });
  return (await rs.json<{ time_bucket: string, count: string }>()).map(row => ({
    time: row.time_bucket,
    count: Number(row.count)
  }));
}

/**
 * 2. MEDIUM RESOLUTION: 10-Minute Intervals (Best for 3-12 hours)
 */
async getTenMinuteTimeSeries(shortUrl: string, hoursLimit: number = 12) {
  const rs = await this.client.query({
    query: `
      SELECT 
        toStartOfInterval(timestamp, INTERVAL 10 minute) as time_bucket, 
        count() as count
      FROM link_clicks
      WHERE shortUrl = {url:String}
        AND timestamp >= subtractHours(now(), {limit:UInt16})
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `,
    query_params: { url: shortUrl, limit: hoursLimit },
    format: 'JSONEachRow',
  });
  return (await rs.json<{ time_bucket: string, count: string }>()).map(row => ({
    time: row.time_bucket,
    count: Number(row.count)
  }));
}

/**
 * 3. STANDARD RESOLUTION: Per-Hour (Best for 24h to 7 days)
 */
async getHourlyTimeSeries(shortUrl: string, daysLimit: number = 7) {
  const rs = await this.client.query({
    query: `
      SELECT 
        toStartOfHour(timestamp) as time_bucket, 
        count() as count
      FROM link_clicks
      WHERE shortUrl = {url:String}
        AND timestamp >= subtractDays(now(), {limit:UInt16})
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `,
    query_params: { url: shortUrl, limit: daysLimit },
    format: 'JSONEachRow',
  });
  return (await rs.json<{ time_bucket: string, count: string }>()).map(row => ({
    time: row.time_bucket,
    count: Number(row.count)
  }));
}
}