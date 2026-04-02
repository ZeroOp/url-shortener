# 📊 Analytics Service

## 📌 Overview

The **Analytics Service** is responsible for tracking and analyzing URL activity in real time.

It follows a **fully event-driven architecture** and uses **ClickHouse (OLAP database)** for high-speed analytics.

---

## 🧩 Responsibilities

* Track URL clicks
* Store URL metadata
* Provide analytics dashboards
* Aggregate data efficiently

---

## ⚡ Architecture Highlights

* Event-driven (via NATS)
* High-throughput ingestion
* Real-time aggregation using **Materialized Views**
* Optimized for read-heavy analytics queries

---

## 📡 Event Consumption (NATS)

### Events Handled

* **`url-clicked`**

  * Stores click events (shortUrl, IP, userAgent, timestamp)

* **`url-created`**

  * Stores metadata (shortUrl, longUrl, userId)

* **`url-deleted`**

  * Marks URL as `deleted` (soft delete)

* **`url-expired`**

  * Marks URL as `expired`

---

### Reliability Strategy

* Data is written to ClickHouse **before ACK**
* If DB write fails:

  * Message is **not acknowledged**
  * NATS automatically retries

---

## 🛢️ ClickHouse Cluster

* **4 Nodes**

  * 2 Shards
  * 2 Replicas

### Why This Setup?

* Sharding → distributes write load
* Replication → ensures fault tolerance

---

### Coordination

* Uses **ClickHouse Keeper** (ZooKeeper alternative)
* Handles:

  * Replication
  * Cluster coordination

---

## 📦 Data Modeling

### 1. Raw Events Table

* Stores all click events (`link_clicks`)
* High ingestion rate

---

### 2. Metadata Table

* Stores URL info (`url_metadata`)
* Uses **ReplacingMergeTree**

#### Why?

* Enables **upserts using versioning**
* Latest record wins (active / deleted / expired)

---

### 3. Aggregation Table

* Stores daily stats (`daily_stats`)
* Precomputed using Materialized View

---

## 🔄 Materialized View (Core Optimization)

```sql
CREATE MATERIALIZED VIEW analytics.link_clicks_mv 
TO analytics.daily_stats_local AS
SELECT 
    shortUrl, 
    toDate(timestamp) AS day, 
    count() AS total_clicks 
FROM analytics.link_clicks_local 
GROUP BY shortUrl, day;
```

### Why This Matters

* Automatically aggregates data on insert
* No need for expensive runtime queries
* Enables fast dashboard responses

---

## 📊 Query Capabilities

### URL-Level Analytics

* Daily clicks
* Time-series (1 min / 10 min / hourly)

### User-Level Analytics

* Total links
* Active vs expired links
* Total clicks across all URLs

### Advanced Insights

* Device breakdown (Mobile / Desktop)
* Geo distribution (country)
* Top performing links

---

## ⏱️ Time-Series Optimization

Supports multiple resolutions:

* **1 minute** → last 1–2 hours
* **10 minutes** → last 12 hours
* **1 hour** → last 7 days

---

## 🌐 API Routes

All routes prefixed with: `/api/analytics`

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| GET    | `/summary`              | User analytics summary     |
| GET    | `/charts/clicks`        | Click trends               |
| GET    | `/top-links`            | Top performing URLs        |
| GET    | `/counts`               | Click counts for all links |
| GET    | `/timeseries/:shortUrl` | Time-series analytics      |

---

## 🔄 Data Consistency Strategy

* Writes are append-only (ClickHouse)
* Updates handled via:

  * **Version-based upserts**
* Deletes are **soft deletes** (status change)

---

## ⚖️ Design Decisions

### Why ClickHouse?

* Built for OLAP workloads
* Handles massive event ingestion
* Extremely fast aggregations

---

### Why Materialized Views?

* Precompute aggregates
* Reduce query latency
* Improve dashboard performance

---

### Why Event-Driven?

* Decouples analytics from core services
* No impact on URL redirection performance
* Scales independently

---

## 📌 Summary

* 📊 Real-time analytics using ClickHouse
* ⚡ High ingestion via event streaming (NATS)
* 🔄 Automatic aggregation with Materialized Views
* 📈 Supports advanced analytics & dashboards
* 🚀 Scales independently from core services

---

> This service is optimized for high-volume analytics with minimal impact on the core URL system.
