import { Listener, Subjects, UrlExpiredEvent, UrlStatus } from "@zeroop-dev/common/build/url-shortner/events";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Url } from "../../models/url";

export class UrlExpiredListner extends Listener<UrlExpiredEvent> {
    subject: Subjects.UrlExpired = Subjects.UrlExpired;
    queueGroupName: string = queueGroupName;

    async onMessage(data: UrlExpiredEvent['data'], msg: Message) {
        const { shortUrl } = data;

        try {
            const url = await Url.findOne({ 
                shortUrl, 
                status: UrlStatus.Active 
            });

            if (!url) {
                console.log(`[URL-SERVICE] No active URL found for ${shortUrl}. It might have been deleted or already expired.`);
                return msg.ack();
            }

            url.set({ status: UrlStatus.Expired });
            await url.save();

            
            console.log(`[URL-SERVICE] Document ${url.id} for ${shortUrl} has been marked as Expired.`);

            msg.ack();
        } catch (err) {
            console.error('[URL-SERVICE] Error processing expiration event:', err);
        }
    }
}