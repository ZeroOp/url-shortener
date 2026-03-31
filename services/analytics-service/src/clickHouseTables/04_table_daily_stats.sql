-- The Local Replicated Table for pre-aggregated stats
CREATE TABLE IF NOT EXISTS analytics.daily_stats_local ON CLUSTER 'url_analytics_cluster' (
    shortUrl String,
    day Date,
    total_clicks UInt64
)
ENGINE = ReplicatedSummingMergeTree('/clickhouse/tables/{shard}/daily_stats', '{replica}')
ORDER BY (shortUrl, day);

-- The Distributed Table
CREATE TABLE IF NOT EXISTS analytics.daily_stats ON CLUSTER 'url_analytics_cluster' 
AS analytics.daily_stats_local
ENGINE = Distributed('url_analytics_cluster', 'analytics', 'daily_stats_local', sipHash64(shortUrl));