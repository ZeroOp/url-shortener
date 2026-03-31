import { Listener, Subjects, UrlExpiredEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { clickhouseWrapper } from "../clickhouse-wrapper";

export class UrlExpiredListener extends Listener<UrlExpiredEvent> {
    subject: Subjects.UrlExpired = Subjects.UrlExpired;
    queueGroupName: string = queueGroupName;

    /**
     * Helper to convert JS Date to ClickHouse-friendly 'YYYY-MM-DD HH:MM:SS'
     */
    private formatDateForClickHouse(date: Date): string {
        return date.toISOString()
            .replace('T', ' ')      // Replace 'T' with a space
            .split('.')[0];        // Remove milliseconds and 'Z'
    }

    async onMessage(data: UrlExpiredEvent['data'], msg: Message) {
        const { shortUrl } = data;

        try {
            // 1. Fetch existing metadata to preserve context (userId, longUrl)
            const existing = await clickhouseWrapper.metadata.getLatest(shortUrl);

            if (!existing) {
                console.warn(`[Analytics] No existing metadata found for ${shortUrl}. Expiring with default values.`);
            }

            // 2. Perform the 'expired' status update (Upsert)
            // Using ReplacingMergeTree logic: higher version overrides older status
            await clickhouseWrapper.metadata.upsert({
                shortUrl,
                longUrl: existing?.longUrl ?? '',
                userId: existing?.userId ?? 'anonymous',
                status: 'expired',
                version: Date.now(), 
                updated_at: this.formatDateForClickHouse(new Date())
            });

            // 3. Confirm processing to NATS
            msg.ack();
            
            console.log(`[Analytics] URL marked as expired: ${shortUrl}`);
        } catch (err) {
            // Error logged, NATS will redeliver this message after ackWait expires
            console.error('[Analytics] Error processing URL expiration:', err);
        }
    }
}