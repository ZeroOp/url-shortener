-- 1. The Local Replicated Table (Stores the actual data on each shard)
CREATE TABLE IF NOT EXISTS analytics.link_clicks_local ON CLUSTER 'url_analytics_cluster' (
    shortUrl String,
    timestamp DateTime64(3, 'UTC') CODEC(DoubleDelta, LZ4),
    ip String,
    userAgent String,
    country String DEFAULT 'Unknown',
    city String DEFAULT 'Unknown'
) 
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/link_clicks', '{replica}')
PARTITION BY toYYYYMM(timestamp)
ORDER BY (shortUrl, timestamp);

-- 2. The Distributed Table (The "Router" your Node.js app will talk to)
CREATE TABLE IF NOT EXISTS analytics.link_clicks ON CLUSTER 'url_analytics_cluster' 
AS analytics.link_clicks_local
ENGINE = Distributed('url_analytics_cluster', 'analytics', 'link_clicks_local', rand());