import { ClickHouseClient } from '@clickhouse/client';

/**
 * Raw interfaces representing the shape of data coming 
 * directly from the ClickHouse HTTP response.
 */
interface RawDailyStat { day: string; clicks: string | number; }
interface RawGlobalStat { date: string; clicks: string | number; }
interface RawTopLink { shortUrl: string; clicks: string | number; }
interface RawTotalClicks { totalClicks: string | number; }

export interface DailyStatRow {
  day: string;
  clicks: number;
}

export interface GlobalStatRow {
  date: string;
  clicks: number;
}

export interface TopLinkRow {
  shortUrl: string;
  clicks: number;
}

export class StatsRepository {
  constructor(private client: ClickHouseClient) {}

  /**
   * Gets daily click totals for a specific URL.
   */
  async getDailyStats(shortUrl: string, daysLimit: number = 30): Promise<DailyStatRow[]> {
    const rs = await this.client.query({
      query: `
        SELECT 
          day, 
          sum(total_clicks) as clicks
        FROM analytics.daily_stats
        WHERE shortUrl = {url:String}
          AND day >= subtractDays(today(), {limit:UInt16})
        GROUP BY day
        ORDER BY day DESC
      `,
      query_params: { url: shortUrl, limit: daysLimit },
      format: 'JSONEachRow',
    });

    // The fix: explicitly casting the return of json() as an array of the raw type
    const rows = await rs.json() as RawDailyStat[];
    
    return rows.map((row: RawDailyStat): DailyStatRow => ({
      day: String(row.day),
      clicks: Number(row.clicks)
    }));
  }

  /**
   * Gets total clicks across all links owned by a user.
   */
  async getTotalUserClicks(userId: string): Promise<number> {
    const rs = await this.client.query({
      query: `
        SELECT sum(total_clicks) as totalClicks
        FROM analytics.daily_stats
        WHERE shortUrl GLOBAL IN (
          SELECT shortUrl FROM analytics.url_metadata FINAL WHERE userId = {uid:String}
        )
      `,
      query_params: { uid: userId },
      format: 'JSONEachRow',
    });

    const rows = await rs.json() as RawTotalClicks[];
    return rows[0] ? Number(rows[0].totalClicks) : 0;
  }

  /**
   * Gets click data for the chart (clicks per day) for all user's links.
   */
  async getGlobalDailyStats(userId: string, daysLimit: number = 7): Promise<GlobalStatRow[]> {
    const rs = await this.client.query({
      query: `
        SELECT 
          formatDateTime(day, '%Y-%m-%d') as date,
          sum(total_clicks) as clicks
        FROM analytics.daily_stats
        WHERE day >= subtractDays(today(), {limit:UInt16})
        AND shortUrl GLOBAL IN (
          SELECT shortUrl FROM analytics.url_metadata FINAL WHERE userId = {uid:String}
        )
        GROUP BY day
        ORDER BY day ASC
      `,
      query_params: { uid: userId, limit: daysLimit },
      format: 'JSONEachRow',
    });

    const rows = await rs.json() as RawGlobalStat[];
    
    return rows.map((row: RawGlobalStat): GlobalStatRow => ({
      date: row.date,
      clicks: Number(row.clicks)
    }));
  }

  /**
   * Gets the most successful links for a user based on total click volume.
   */
  async getTopLinks(userId: string, limit: number = 5): Promise<TopLinkRow[]> {
    const rs = await this.client.query({
      query: `
        SELECT 
          shortUrl, 
          sum(total_clicks) as clicks 
        FROM analytics.daily_stats 
        WHERE shortUrl GLOBAL IN (
          SELECT shortUrl FROM analytics.url_metadata FINAL WHERE userId = {uid:String}
        )
        GROUP BY shortUrl 
        ORDER BY clicks DESC 
        LIMIT {limit:UInt16}
      `,
      query_params: { 
        uid: userId, 
        limit: limit 
      },
      format: 'JSONEachRow',
    });

    const rows = await rs.json() as RawTopLink[];
    
    return rows.map((row: RawTopLink): TopLinkRow => ({
      shortUrl: row.shortUrl,
      clicks: Number(row.clicks)
    }));
  }

  /**
   * Gets total click counts for all links belonging to a user.
   * Returns an array of { shortUrl: string, count: number }
   */
  async getAllLinkCounts(userId: string): Promise<{ shortUrl: string, count: number }[]> {
    const rs = await this.client.query({
      query: `
        SELECT 
          meta.shortUrl as shortUrl, 
          sum(stats.total_clicks) as count
        FROM analytics.url_metadata meta FINAL
        -- Added GLOBAL keyword here to fix distributed join error
        GLOBAL LEFT JOIN analytics.daily_stats stats ON meta.shortUrl = stats.shortUrl
        WHERE meta.userId = {uid:String}
        GROUP BY meta.shortUrl
      `,
      query_params: { uid: userId },
      format: 'JSONEachRow',
    });
  
    const rows = await rs.json() as { shortUrl: string, count: string | number }[];
    
    return rows.map(row => ({
      shortUrl: row.shortUrl,
      count: Number(row.count) || 0 
    }));
  }

}