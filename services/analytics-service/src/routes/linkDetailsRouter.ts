import { requireAuth } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express, { Request, Response } from 'express';
import { clickhouseWrapper } from '../clickhouse-wrapper';

const router = express.Router();

/**
 * GET /api/analytics/:shortUrl/details
 * Combines metadata, daily stats, and device info for one link.
 */
router.get('/api/analytics/:shortUrl/details',
    requireAuth,
    async (req: Request, res: Response) => {
        const { shortUrl } = req.params;
        const userId = req.currentUser!.id;

        if (typeof shortUrl !== 'string') {
            return res.status(400).send({ error: 'Invalid shortUrl' });
        }
        
        try {
            // 1. Verify ownership & get metadata
            const metadata = await clickhouseWrapper.metadata.getLatest(shortUrl);
            
            if (!metadata || metadata.userId !== userId) {
                return res.status(404).send({ error: 'Link not found or access denied' });
            }

            // 2. Fetch parallel stats
            const [dailyStats, devices, geo] = await Promise.all([
                clickhouseWrapper.stats.getDailyStats(shortUrl, 30),
                clickhouseWrapper.clicks.getDeviceStats(shortUrl),
                clickhouseWrapper.clicks.getGeoStats(shortUrl)
            ]);

            res.send({
                metadata,
                charts: {
                    timeline: dailyStats,
                    devices,
                    locations: geo
                }
            });
        } catch (err) {
            console.error(`[Analytics] Detail View Error for ${shortUrl}:`, err);
            res.status(500).send({ error: 'Internal Server Error' });
        }
});

export { router as linkDetailsRouter };