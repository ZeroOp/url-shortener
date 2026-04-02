import { requireAuth } from '@zeroop-dev/common/build/url-shortner/middlewares';
import express from 'express';
import { clickhouseWrapper } from '../clickhouse-wrapper';
const router = express.Router();

// 1. The Overview Stats
router.get('/api/analytics/summary', requireAuth, async (req, res) => { 
    const userId = req.currentUser!.id;
    const summary = await clickhouseWrapper.metadata.getUserSummary(userId);
    const totalClicks = await clickhouseWrapper.stats.getTotalUserClicks(userId);
    
    res.send({
        ...summary,
        totalClicks: Number(totalClicks)
    });
});

// 2. The Chart Data
router.get('/api/analytics/charts/clicks', requireAuth, async (req, res) => { 
    const userId = req.currentUser!.id;
    const days = Number(req.query.days) || 7;
    const chartData = await clickhouseWrapper.stats.getDailyStats(userId, days);

    res.send(chartData);
});

// 3. The Leaderboard
router.get('/api/analytics/top-links',requireAuth, async (req, res) => { 
    const userId = req.currentUser!.id;
    const limit = Number(req.query.limit) || 5;

    try {
        const topLinks = await clickhouseWrapper.stats.getTopLinks(userId, limit);
        res.send(topLinks);
    } catch (err) {
        console.error('[Analytics] Top Links Error:', err);
        res.status(500).send({ error: 'Failed to fetch top links' });
    }
});

// 4. Bulk counts for the "All Links" table
router.get('/api/analytics/counts', requireAuth, async (req, res) => { 
    try {
        const userId = req.currentUser!.id;
        const counts = await clickhouseWrapper.stats.getAllLinkCounts(userId);
        res.send(counts);
    } catch (err) {
        console.error('[Analytics] Bulk Counts Error:', err);
        res.status(500).send({ error: 'Failed to fetch click counts' });
    }
});


/**
 * 5. Time-Series Metrics for a specific link
 * GET /api/analytics/timeseries/:shortUrl?resolution=1m&limit=2
 */
router.get('/api/analytics/timeseries/:shortUrl', requireAuth, async (req, res) => {
    const shortUrl = req.params.shortUrl as string;
    const resolution = req.query.resolution as string || '1h'; // 1m, 10m, 1h
    const limit = Number(req.query.limit) || 24; // Hours or Days depending on res
    const userId = req.currentUser!.id;

    try {
        
        let data;

        switch (resolution) {
            case '1m':
                // High res: Last 'limit' hours in 1-minute buckets
                data = await clickhouseWrapper.clicks.getMinuteTimeSeries(shortUrl, limit);
                break;
            case '10m':
                // Med res: Last 'limit' hours in 10-minute buckets
                data = await clickhouseWrapper.clicks.getTenMinuteTimeSeries(shortUrl, limit);
                break;
            case '1h':
            default:
                // Standard res: Last 'limit' days in 1-hour buckets
                data = await clickhouseWrapper.clicks.getHourlyTimeSeries(shortUrl, limit);
                break;
        }

        res.send(data);
    } catch (err) {
        console.error(`[Analytics] TimeSeries Error (${shortUrl}):`, err);
        res.status(500).send({ error: 'Failed to fetch time-series data' });
    }
});

export { router as dashboardRouter };