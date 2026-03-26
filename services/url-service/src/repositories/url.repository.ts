import { Client } from 'cassandra-driver';
import { Redis } from 'ioredis';
export class UrlRepository {
    constructor(
      private cassandra: Client,
      private redis: Redis
    ) {}
  
    async findExistingByLongUrl(originalUrl: string): Promise<string | null> {
        // 1. Check Redis First (Fast Path)
        const cached = await this.redis.get(`rev_global:${originalUrl}`);
        if (cached) return cached;
    
        // 2. Cache Miss? Check Cassandra Reverse Table (Reliable Path)
        const query = 'SELECT short_url FROM url_by_original WHERE original_url = ?';
        const res = await this.cassandra.execute(query, [originalUrl], { prepare: true });
    
        if (res.rowLength > 0) {
          const shortId = res.first().short_url;
          // 3. Backfill Redis so the next check is fast
          await this.redis.set(`rev_global:${originalUrl}`, shortId, 'EX', 86400);
          return shortId;
        }
    
        return null;
    }
      
    async isAliasTaken(shortUrl: string): Promise<boolean> {
        // Check if the short code is already in use (for Custom URLs)
        const exists = await this.redis.exists(`url:${shortUrl}`);
        if (exists) return true;
      
        const res = await this.cassandra.execute(
          'SELECT short_url FROM url_mappings WHERE short_url = ?', 
          [shortUrl], 
          { prepare: true }
        );
        return res.rowLength > 0;
    }
  
    /**
     * CREATE: Now includes the Reverse Index update
     */
    async create(data: {
      shortUrl: string;
      originalUrl: string;
      userId: string;
      expiresAt?: Date;
    }) {
      const query = `
        INSERT INTO url_mappings (short_url, original_url, user_id, created_at, expires_at) 
        VALUES (?, ?, ?, toTimestamp(now()), ?)
      `;
      
      const params = [data.shortUrl, data.originalUrl, data.userId, data.expiresAt || null];
  
      // Write to Cassandra
      await this.cassandra.execute(query, params, { prepare: true });
      
      // Write to Redis (Standard Redirect Cache)
      await this.redis.set(`url:${data.shortUrl}`, data.originalUrl, 'EX', 86400);
  
      // Write to Redis (REVERSE INDEX for de-duplication)
      // This allows us to find the shortUrl using the Long URL + UserID later
      await this.redis.set(`rev:${data.userId}:${data.originalUrl}`, data.shortUrl, 'EX', 86400);
    }
  }