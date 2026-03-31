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
}