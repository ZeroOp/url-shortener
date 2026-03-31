import { Listener, Subjects, UrlExpiredEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { clickhouseWrapper } from "../clickhouse-wrapper";

export class UrlExpiredListener extends Listener<UrlExpiredEvent> {
    subject: Subjects.UrlExpired = Subjects.UrlExpired;
    queueGroupName: string = queueGroupName;

    async onMessage(data: UrlExpiredEvent['data'], msg: Message) {
        const { shortUrl } = data;

        try {
            // 1. Fetch existing metadata to preserve context (userId, longUrl)
            const existing = await clickhouseWrapper.metadata.getLatest(shortUrl);

            // 2. Perform the 'expired' status update (Upsert)
            await clickhouseWrapper.metadata.upsert({
                shortUrl,
                longUrl: existing?.longUrl ?? '',
                userId: existing?.userId ?? 'anonymous',
                status: 'expired',
                version: Date.now(), // High version for ReplacingMergeTree
                updated_at: new Date().toISOString()
            });

            // 3. Confirm processing to NATS
            msg.ack();
            
            console.log(`[Analytics] URL marked as expired: ${shortUrl}`);
        } catch (err) {
            console.error('[Analytics] Error processing URL expiration:', err);
            // No ack() means NATS will redeliver based on your cluster's ackWait
        }
    }
}