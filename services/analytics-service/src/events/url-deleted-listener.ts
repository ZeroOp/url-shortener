import { Listener, Subjects, UrlDeletedEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { clickhouseWrapper } from "../clickhouse-wrapper";

export class UrlDeletedListener extends Listener<UrlDeletedEvent> {
    subject: Subjects.UrlDeleted = Subjects.UrlDeleted;
    queueGroupName: string = queueGroupName;

    async onMessage(data: UrlDeletedEvent['data'], msg: Message) {
        const { shortUrl } = data;

        try {
            // 1. Fetch the existing metadata first
            // This ensures we don't lose the original longUrl or userId in the ClickHouse record
            const existing = await clickhouseWrapper.metadata.getLatest(shortUrl);

            // 2. Upsert the 'deleted' status
            await clickhouseWrapper.metadata.upsert({
                shortUrl,
                longUrl: existing?.longUrl ?? '', 
                userId: existing?.userId ?? 'anonymous',
                status: 'deleted',
                version: Date.now(), // Higher version ensures this 'deleted' status wins the merge
                updated_at: new Date().toISOString()
            });

            // 3. Acknowledge the message
            msg.ack();
            
            console.log(`[Analytics] Marked URL as deleted: ${shortUrl}`);
        } catch (err) {
            console.error('[Analytics] Error processing URL deletion:', err);
            // msg.ack() is skipped; NATS will redeliver
        }
    }
}