import express, { Request, Response } from 'express';
import { Url, UrlStatus } from '../models/url';
import { BadRequestError, NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { redisClient } from '../redis-client';
import { UrlClickedPublisher } from '../events/publishers/url-clicked-publisher';
import { natsWrapper } from '../nats-wrapper';
import { UrlClickedEvent } from '@zeroop-dev/common/build/url-shortner/events';
import { performance } from 'perf_hooks';
const router = express.Router();

const publishClickEvent = async (event: UrlClickedEvent["data"]) => {
    try {
        await new UrlClickedPublisher(natsWrapper.client).publish(event);
        console.log(`[url] Event Published: Clicked Url for ${event.shortUrl}`);
    } catch (err) {
        // We log the error but don't fail the request since the DB save was successful.
        // In a more advanced setup, you'd use the "Outbox Pattern" here.
        console.error('[url] Failed to publish UrlCreated event', err);
    }
}

const handleRedirection = async (shortiUrl: string, req: Request, res: Response) => {
    // START TIMER: The very first thing we do
    const start = performance.now(); 

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    
    let longUrl: string | null = null;

    // 1. Try Cache First (Redis)
    longUrl = await redisClient.get(shortiUrl);
    
    // 2. Database Fallback if not in Redis
    if (!longUrl) {
        const url = await Url.findOne({ 
            shortUrl: shortiUrl, 
            status: UrlStatus.Active 
        });

        if (!url) {
            throw new NotFoundError();
        }
        
        longUrl = url.longUrl;
        // Update Cache for 24 hours
        await redisClient.setex(shortiUrl, 86400, longUrl);
    }

    // STOP TIMER: Right before we send the response
    const end = performance.now();
    const processingTimeMs = parseFloat((end - start).toFixed(3)); // e.g., 1.452ms

    // 3. Publish Event with Latency
    publishClickEvent({ 
        shortUrl: shortiUrl, 
        ip, 
        userAgent, 
        timestamp: new Date().toISOString(),
        processingTimeMs // Now sending the actual measured time
    });

    return res.status(301).redirect(longUrl);
};
/**
 * Endpoint 1: Random Stream
 */
router.get('/r/:shortId', async (req: Request, res: Response) => {
    const { shortId } = req.params;

    // Type Guard: Ensure it's a string and not an array
    if (typeof shortId !== 'string') {
        throw new BadRequestError('Invalid short ID format');
    }

    await handleRedirection(shortId, req, res);
});

/**
 * Endpoint 2: Custom Stream
 */
router.get('/:customAlias', async (req: Request, res: Response) => {
    const { customAlias } = req.params;

    // Type Guard
    if (typeof customAlias !== 'string') {
        throw new BadRequestError('Invalid alias format');
    }

    await handleRedirection(customAlias, req, res);
});

export { router as redirectRouter };