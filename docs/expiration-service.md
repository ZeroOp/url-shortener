# ⏳ Expiration Service

## 📌 Overview

The **Expiration Service** is responsible for handling **TTL (Time-To-Live)** logic for URLs.

It ensures that URLs are automatically expired at the correct time without impacting the core URL Service.

---

## 🧩 Responsibilities

* Schedule URL expiration
* Trigger expiration events
* Decouple expiration logic from core services

---

## ⚙️ How It Works

### Event-Driven Scheduling

1. Listens to **`url-created`** events
2. Checks if `expiresAt` is present
3. Schedules a delayed job using **Bull Queue**

---

### Job Execution

* When delay expires:

  * Publishes **`url-expired`** event via NATS

---

## 🔄 Flow

### URL Creation

1. URL Service emits `url-created`
2. Expiration Service receives event
3. If TTL exists:

   * Calculates delay
   * Schedules job

---

### Expiration Trigger

1. Bull queue processes job after delay
2. Publishes `url-expired` event
3. Other services react:

   * URL Service → delete/mark expired
   * Analytics Service → update status

---

## 📡 Event Communication

### Consumes

* **`url-created`**

  * Used to schedule expiration

### Publishes

* **`url-expired`**

  * Signals that URL TTL is reached

---

## 🧵 Queue System (Bull + Redis)

* Uses **Bull Queue**
* Backed by a dedicated **Redis instance**

### Why Bull?

* Supports delayed jobs natively
* Reliable background processing
* Simple and efficient

---

## 🛢️ Redis Setup

* Dedicated Redis (not shared with other services)
* Runs as **StatefulSet**
* Uses **Persistent Volume (PVC)**

### Persistence

* AOF enabled (`appendonly yes`)
* Ensures jobs survive restarts

---

## ⚖️ Design Decisions

### Why Separate Service?

* Keeps URL Service lightweight
* Avoids blocking operations
* Improves scalability

---

### Why Event-Driven?

* Loose coupling between services
* No direct dependency on URL Service
* Easy to extend

---

### Why Redis Persistence?

* Prevents loss of scheduled jobs
* Ensures expiration guarantees

---

## ⚠️ Edge Case Handling

* If `expiresAt` is in the past:

  * Job executes immediately (`delay = 0`)
* Ensures no URL is missed

---

## 📌 Summary

* ⏳ Handles TTL-based expiration asynchronously
* 📡 Fully event-driven using NATS
* 🧵 Uses Bull + Redis for delayed jobs
* 💾 Persistent storage ensures reliability
* 🚀 Keeps core services lightweight

---

> This service ensures reliable and scalable expiration handling without impacting request latency.
