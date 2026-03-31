import { Listener, Subjects, UrlCreatedEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { clickhouseWrapper } from "../clickhouse-wrapper";

export class UrlCreatedListener extends Listener<UrlCreatedEvent> {
    subject: Subjects.UrlCreated = Subjects.UrlCreated;
    queueGroupName: string = queueGroupName;

    async onMessage(data: UrlCreatedEvent['data'], msg: Message) {
        const { shortUrl, longUrl, userId } = data;

        try {
            // Persist the metadata to the url_metadata table
            await clickhouseWrapper.metadata.upsert({
                shortUrl,
                longUrl,
                userId: userId ?? 'anonymous',
                status: 'active', // Default status for a new URL
                version: Date.now(), // Crucial for ReplacingMergeTree logic
                updated_at: new Date().toISOString().replace('T', ' ').replace('Z', '')
            });

            // Acknowledge the message only after successful write
            msg.ack();
            
            console.log(`[Analytics] Synced metadata for: ${shortUrl}`);
        } catch (err) {
            console.error('[Analytics] Error syncing URL metadata:', err);
            // msg.ack() is skipped, allowing for NATS redelivery
        }
    }
}