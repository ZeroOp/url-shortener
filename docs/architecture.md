# 🏗️ System Architecture
![System Architecture](.Images/architecture.png)

## 📌 Overview

The **ZeroOp URL Shortener** is a **distributed, event-driven microservices system** designed for high scalability, low latency, and real-time analytics.

Key goals:

* High throughput (reads & writes)
* Fault tolerance
* Horizontal scalability
* Real-time event processing

---

## 🧩 Core Components

### API Gateway

* Entry point for all requests
* Routes traffic to services
* Handles auth forwarding

---

### Auth Service

* JWT-based authentication
* Stores users in **MongoDB**

---

### URL Service (Core)

* URL shortening & redirection
* Stores mappings in **MongoDB**
* Uses **Redis** for caching
* Publishes events to **NATS**

---

### Counter Service

* Generates unique short IDs
* Uses **Redis atomic counters**
* Ensures high throughput, no collisions

---

### Analytics Service

* Consumes events from **NATS**
* Stores data in **ClickHouse**
* Provides real-time metrics using MVs

---

### Expiration Service

* Handles TTL-based link expiry
* Uses **Redis + BullJS**
* Cleans up expired URLs

---

### Event Bus (NATS)

* Enables async communication
* Used for analytics & system events

---

### Databases

**MongoDB**

* User data & URL mappings
* Replica set for high availability

**Redis Cluster**

* Caching, counters, scheduling

**ClickHouse**

* High-speed analytics storage

---

## 🔄 Data Flow

### URL Shortening

1. Client → API Gateway
2. Auth validation
3. URL Service → Counter Service (ID)
4. Store in MongoDB + cache in Redis
5. Return short URL

---

### Redirection

1. Client hits short URL
2. URL Service checks Redis → MongoDB fallback
3. Redirect to original URL
4. Emit event to NATS

---

### Analytics

1. Event → NATS
2. Analytics Service consumes
3. Stored in ClickHouse
4. Metrics updated via MVs

---

### Expiration

1. TTL scheduled
2. Expiration Service triggers
3. Remove cache + update DB

---

## ⚖️ Design Choices

* **Microservices** → independent scaling & isolation
* **NATS (Event-driven)** → loose coupling, async processing
* **Redis** → fast cache + atomic counters
* **ClickHouse** → optimized for analytics workloads

---

## 📈 Scalability & Reliability

* Horizontal scaling for all services
* MongoDB → replicas
* Redis → cluster (sharding + failover)
* Stateless services → easy recovery

---

## 📌 Summary

* ⚡ Fast redirects via Redis caching
* 📊 Real-time analytics via event streaming
* 🔁 Fault-tolerant distributed system
* 📈 Scales horizontally

---

> See individual service docs for deeper implementation details.
