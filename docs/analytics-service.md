# 📊 Analytics Service

The Analytics Service is a high-throughput, event-driven microservice responsible for tracking, processing, and aggregating every interaction with a short URL. It leverages **ClickHouse** to provide real-time insights with sub-second query latency.

---

## 🛠️ Core Responsibilities

- **Event Ingestion:** Listens to the `url:clicked`, `url:expired` and `url:deleted` subjects on the **NATS Streaming** bus.
- **Metadata Synchronization:** Maintains a mirrored state of URL metadata (Short URL, Long URL, UserID) within ClickHouse to allow for "stitched" API responses.
- **Data Transformation:** Normalizes high-resolution browser timestamps into ClickHouse-compatible formats (removing 'T' and 'Z' markers).
- **Real-Time Aggregation:** Orchestrates the flow of raw click events into pre-aggregated summary tables via Materialized Views.

---

## 🗄️ ClickHouse Architecture (High Availability)

The storage layer is designed as a distributed cluster to ensure zero data loss and horizontal scalability.

- **Cluster Configuration:** `url_analytics_cluster`
- **Topology:** 2 Shards × 2 Replicas = **4 Dedicated Nodes** (`clickhouse-0` through `clickhouse-3`).
- **Engine:** Uses the `ReplicatedMergeTree` family with **Zookeeper** for coordination.

---

## 🔄 The Data Pipeline (The "Bridge")

We implement an **OLAP (Online Analytical Processing)** pattern to separate raw logs from display-ready stats.

1. **Raw Table (`link_clicks`):** A distributed table that stores every individual click (IP, User Agent, Timestamp).
2. **The Worker (`link_clicks_mv`):** A Materialized View that acts as an internal trigger. It "watches" the raw table and automatically calculates daily totals.
3. **Summary Table (`daily_stats`):** A `SummingMergeTree` table that stores the final counts. The frontend queries this table for the Management Dashboard, ensuring the UI stays fast even with millions of clicks.

---

## 🛡️ Error Handling & Consistency

- **Strict Typing:** The service automatically handles ISO-8601 string conversions to prevent ClickHouse insertion failures (`CANNOT_PARSE_INPUT_ASSERTION_FAILED`).
- **Idempotency:** Uses a `version` column (based on `Date.now()`) in the `url_metadata` table. Combined with `ReplacingMergeTree`, this ensures the latest state (like a 'deleted' status) always wins during background merges.
- **Graceful Degradation:** If ClickHouse is temporarily unreachable, the service stays alive and allows NATS to retry message delivery, ensuring no click data is ever dropped.

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/analytics/counts` | `GET` | Returns aggregated click counts for all links owned by the user. |
| `/api/analytics/stats/:code` | `GET` | Returns detailed time-series data for a specific short link. |