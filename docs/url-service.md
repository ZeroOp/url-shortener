# 🔗 URL Service

## 📌 Overview

The **URL Service** is the core of the ZeroOp platform. It handles:

* URL shortening
* Redirection
* Custom alias creation
* URL deletion
* User-specific link retrieval

It is designed to handle **very high read traffic** with low latency while maintaining consistency for writes.

---

## 🧩 Responsibilities

* Generate short URLs
* Redirect users to original URLs
* Manage user links (recent & all)
* Handle URL deletion
* Publish events for analytics & expiration

---

## 🔁 Redirection Strategy

* Uses **HTTP 302 redirects**
* Avoids CDN usage intentionally:

  * Ensures every request reaches backend
  * Enables accurate **analytics tracking**

---

## ⚡ Caching Layer (Redis Cluster)

* **8-node Redis Cluster**

  * 4 Masters (Shards)
  * 4 Replicas

### Why Sharding?

* Not just for data size
* Primarily to handle **high traffic throughput**

### Caching Strategy

* Each URL cached for **~1 day**
* Reduces database load significantly

---

## 🛢️ Database (MongoDB)

* 3-node **Replica Set**

  * 1 Primary
  * 2 Secondaries

### Write Strategy

* Write acknowledged only after **2 nodes**
* Ensures durability

### Read Strategy

* Reads (especially redirects) served from **replicas**
* Reduces load on primary

### Failover

* Majority-based election (2/3 nodes)
* Automatic primary replacement

---

## 🧠 Stateless Design

* URL Service is **fully stateless**
* Any instance can handle requests
* Easy horizontal scaling

---

## 🔢 ID Generation (Counter Service)

* **Only synchronous dependency in system**
* Used during URL creation

### Optimization Strategy

* Fetch **batch of 3000 shortcodes**
* When ~1500 are consumed → preload next batch asynchronously

### Result

* No latency impact for users
* Appears synchronous but optimized internally

---

## 🔄 Data Flow

### URL Creation

1. Request → URL Service
2. Fetch shortcode from Counter Service
3. Store in MongoDB
4. Cache in Redis
5. Publish `url-created` event

---

### Redirection

1. Request hits short URL
2. Check Redis cache
3. Fallback to MongoDB if needed
4. Return **302 redirect**
5. Publish `url-clicked` event

---

### Deletion

1. Delete request received
2. Remove from Redis
3. Soft delete in MongoDB (status = `DELETED`)
4. Publish `url-deleted` event

---

## 📡 Event-Driven Communication (NATS)

### Publishers

* **`url-created`**

  * Analytics Service → store metadata
  * Expiration Service → schedule TTL

* **`url-clicked`**

  * Analytics Service → track clicks

* **`url-deleted`**

  * Analytics Service → soft delete metrics

---

### Listener

* **`url-expired-listener`**

  * Triggered by Expiration Service
  * Actions:

    * Remove from Redis (permanent)
    * Soft delete in MongoDB

---

## 📦 Data Handling

* Redis → temporary (1 day cache)
* MongoDB → source of truth
* Expired URLs:

  * Hidden from users
  * Still retained (soft delete)

---

## 🌐 API Routes

All routes are prefixed with: `/api/url`

| Method | Endpoint            | Description              |
| ------ | ------------------- | ------------------------ |
| POST   | `/shorten`          | Create short URL         |
| GET    | `/:shortCode`       | Redirect to original URL |
| DELETE | `/delete/:id`       | Delete URL               |
| GET    | `/userLinks/recent` | Get last 10 URLs         |
| GET    | `/userLinks/all`    | Get all user URLs        |

---

## ⚖️ Design Highlights

* ⚡ Optimized for **read-heavy traffic**
* 🧠 Smart batching for ID generation
* 🔄 Event-driven architecture (NATS)
* 📦 Multi-layer storage (Redis + MongoDB)
* 🚀 Horizontally scalable & stateless

---

## 📌 Summary

* Fast redirects via Redis caching
* Accurate analytics (no CDN, 302 redirects)
* Efficient ID generation using batching
* Reliable storage with MongoDB replicas
* Event-driven communication across services

---

> This service is the backbone of the system, optimized for scale, performance, and real-time tracking.
