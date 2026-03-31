import Queue from "bull";
import { natsWrapper } from "../nats-wrapper";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";

interface Payload {
    shortUrl: string;
}
const expirationQueue = new Queue<Payload>('expiration', {
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379
    }
});

expirationQueue.process(async (job) => {
    console.log('I am about to publish an expiration:complete event for', job.data.shortUrl);
    await new ExpirationCompletePublisher(natsWrapper.client).publish({
        shortUrl: job.data.shortUrl
    })
})

export { expirationQueue }