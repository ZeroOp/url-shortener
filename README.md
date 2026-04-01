# Project Documentation

Welcome to the URL Shortener project documentation. Below are the detailed docs for each part of the system:

- [Overall Architecture](docs/architecture.md)
- [Auth Service](docs/auth-service.md)
- [URL Service](docs/url-service.md)
- [Analytics Service](docs/analytics-service.md)
- [Counter Service](docs/counter-service.md)
- [Database Schema](docs/database.md)
- [Caching Strategy](docs/caching.md)

when you run the setup for the first time need to setup the replica sets

kubectl exec -it mongo-0 -- mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'<IP_OF_MONGO_0>:27017'},{_id:1,host:'<IP_OF_MONGO_1>:27017'},{_id:2,host:'<IP_OF_MONGO_2>:27017'}]})"

$ips = (kubectl get pods -l app=redis-cluster -o jsonpath='{range .items[*]}{.status.podIP}:6379 {end}').Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries); kubectl exec -it redis-cluster-0 -- redis-cli --cluster create $ips --cluster-replicas 1 --cluster-yes

The Solution: Create the Materialized View
You need to create a "trigger" that watches link_clicks and automatically updates daily_stats. Run this command in your PowerShell to apply it to clickhouse-0:

PowerShell

kubectl exec -it clickhouse-0 -- clickhouse-client --query "CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.link_clicks_mv TO analytics.daily_stats AS SELECT shortUrl, toDate(timestamp) AS date, count() AS total_clicks FROM analytics.link_clicks GROUP BY shortUrl, date"

Why this fixes it:
Automatic Updates: Every time your analytics-service inserts a new row into link_clicks, this view will immediately increment the total_clicks in daily_stats.

Date-Based Sharding: It converts your high-precision timestamp into a simple date so your daily counts stay organized.

Matches your Query: Since your getAllLinkCounts API joins with daily_stats, it will finally see the numbers it’s looking for.

One Important Note (Historical Data)
Materialized Views in ClickHouse only process new data inserted after the view is created. Since you already have 7 clicks in there, they won't automatically show up in daily_stats.

To move those existing 7 clicks over right now, run this:

