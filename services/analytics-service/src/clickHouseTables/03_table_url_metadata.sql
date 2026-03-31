-- 1. The Local Replicated Table
CREATE TABLE IF NOT EXISTS analytics.url_metadata_local ON CLUSTER 'url_analytics_cluster' (
    shortUrl String,
    longUrl String,
    userId String,
    status String, -- 'active', 'expired', 'deleted'
    version UInt32,
    updated_at DateTime64(3, 'UTC')
) 
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{shard}/url_metadata', '{replica}', version)
ORDER BY (shortUrl);

-- 2. The Distributed Table
CREATE TABLE IF NOT EXISTS analytics.url_metadata ON CLUSTER 'url_analytics_cluster' 
AS analytics.url_metadata_local
ENGINE = Distributed('url_analytics_cluster', 'analytics', 'url_metadata_local', sipHash64(shortUrl));