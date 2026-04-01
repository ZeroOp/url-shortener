-- 7. THE BRIDGE: The Materialized View (The "Worker" that moves data)
-- This connects the Raw Clicks to the Daily Stats.
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.link_clicks_mv 
ON CLUSTER 'url_analytics_cluster' 
TO analytics.daily_stats_local 
AS SELECT 
    shortUrl, 
    toDate(timestamp) AS day, 
    count() AS total_clicks 
FROM analytics.link_clicks_local 
GROUP BY shortUrl, day;