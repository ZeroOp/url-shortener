import { Listener, Subjects, UrlCreatedEvent } from "@zeroop-dev/common/build/url-shortner/events";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class UrlCreatedListner extends Listener<UrlCreatedEvent> {
    subject: Subjects.UrlCreated = Subjects.UrlCreated;
    queueGroupName: string = queueGroupName;
    
    async onMessage(data: UrlCreatedEvent['data'], msg: Message) {
        console.log(`[EVENT RECEIVED] Expiration for: ${data.shortUrl}`);
    
        if (!data.expiresAt) {
            return msg.ack();
        }
    
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        
        // GUARD: If delay is negative, it already expired. 
        // You might want to process it immediately or log a warning.
        const finalDelay = Math.max(0, delay);
    
        console.log(`Scheduling job for ${data.shortUrl} with delay: ${finalDelay}ms`);
    
        await expirationQueue.add(
            { shortUrl: data.shortUrl }, 
            { delay: finalDelay }
        );
    
        msg.ack();
    }
}