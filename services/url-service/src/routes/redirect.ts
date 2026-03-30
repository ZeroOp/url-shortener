import express, { Request, Response } from 'express';
import { Url, UrlStatus } from '../models/url';
import { BadRequestError, NotFoundError } from '@zeroop-dev/common/build/url-shortner/errors';
import { redisClient } from '../redis-client';
const router = express.Router();

/**
 * Helper: Process the redirection logic
 * This handles the Cache-Aside pattern + Click tracking
 */
const handleRedirection = async (shortCode: string, res: Response) => {
    console.log("Point 1:", shortCode);
    // 1. Try Cache First (Redis)
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) {
        // Background task: Increment clicks in DB (don't await to keep redirect fast)
        Url.updateOne({ shortCode }, { $inc: { clicks: 1 } }).exec();
        return res.redirect(cachedUrl);
    }
    console.log("Point 2:", cachedUrl);
    // 2. Database Fallback
    const url = await Url.findOne({ 
        shortUrl: shortCode, 
        status: UrlStatus.Active 
    });

    console.log("point 3:", url);
    if (!url) {
        throw new NotFoundError();
    }


    // 3. Update Cache & Increment Clicks
    // Cache for 24 hours to handle "Viral" links efficiently
    // For ioredis / Cluster mode:
    await redisClient.setex(shortCode, 86400, url.longUrl);
    
    /*
        Send Event to nats streaming server , click event. 
    */

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

    await handleRedirection(shortId, res);
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

    await handleRedirection(customAlias, res);
});

export { router as redirectRouter };