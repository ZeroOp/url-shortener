import express, { Request, Response } from 'express';
import { Url, UrlStatus } from '../models/url';
import { BadRequestError, NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { redisClient } from '../redis-client';
import { UrlClickedPublisher } from '../events/publishers/url-clicked-publisher';
import { natsWrapper } from '../nats-wrapper';
import { UrlClickedEvent } from '@zeroop-dev/common/build/url-shortner/events';
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

/**
 * Helper: Process the redirection logic
 * This handles the Cache-Aside pattern + Click tracking
 */
const handleRedirection = async (shortiUrl: string, req: Request, res: Response) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || 'unknown';
    
    // 1. Try Cache First (Redis)
    const cachedUrl = await redisClient.get(shortiUrl);
    if (cachedUrl) {
        console.log("Picked from cache");
        publishClickEvent({ shortUrl : shortiUrl, ip ,userAgent, timestamp: new Date().toISOString() });
        return res.redirect(cachedUrl);
    }
    
    // 2. Database Fallback
    const url = await Url.findOne({ 
        shortUrl: shortiUrl, 
        status: UrlStatus.Active 
    });

    if (!url) {
        throw new NotFoundError();
    }


    // 3. Update Cache & Increment Clicks
    // Cache for 24 hours to handle "Viral" links efficiently
    // For ioredis / Cluster mode:
    await redisClient.setex(shortiUrl, 86400, url.longUrl);
    
    publishClickEvent({ shortUrl : shortiUrl, ip ,userAgent, timestamp: new Date().toISOString() });
    return res.status(302).redirect(url.longUrl);
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