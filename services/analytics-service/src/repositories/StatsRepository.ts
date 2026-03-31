import { ClickHouseClient } from '@clickhouse/client';

export class StatsRepository {
  constructor(private client: ClickHouseClient) {}

  /**
   * Gets daily click totals for a specific URL.
   */
  async getDailyStats(shortUrl: string, daysLimit: number = 30) {
    const rs = await this.client.query({
      query: `
        SELECT 
          day, 
          sum(total_clicks) as clicks
        FROM daily_stats
        WHERE shortUrl = {url:String}
          AND day >= subtractDays(today(), {limit:UInt16})
        GROUP BY day
        ORDER BY day DESC
      `,
      query_params: { url: shortUrl, limit: daysLimit },
      format: 'JSONEachRow',
    });
    return await rs.json<{ day: string, clicks: string }>();
  }
}