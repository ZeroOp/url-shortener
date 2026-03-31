import { Listener, Subjects, UrlClickedEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { clickhouseWrapper } from "../clickhouse-wrapper";

export class UrlClickedListner extends Listener<UrlClickedEvent> {
    subject: Subjects.UrlClick = Subjects.UrlClick;
    queueGroupName: string = queueGroupName;

    async onMessage( data: UrlClickedEvent['data'], msg: Message ) {
        const { shortUrl , ip = 'unknown', userAgent ='unknown', timestamp } = data;

        const validTimestamp = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
        try {
            // 1. Persist to ClickHouse via our Repository
            // We wrap it in an array because the repository's insertBatch expects ClickEvent[]
            await clickhouseWrapper.clicks.insertBatch([{
                shortUrl,
                ip,
                userAgent,
                // Ensure timestamp is in ISO string format for ClickHouse DateTime64
                timestamp: new Date(validTimestamp).toISOString().replace('T', ' ').replace('Z', '')
            }]);

            // 2. Acknowledge the message ONLY after successful DB write
            // If the DB is down, this line is never reached, and NATS will redeliver.
            msg.ack();
            
                console.log(`[Analytics] Logged click for: ${shortUrl}`);
            } catch (err) {
                console.error('[Analytics] Error processing ClickEvent:', err);
            }
    }
}