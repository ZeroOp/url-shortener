# 🔢 Counter Service

## 📌 Overview

The **Counter Service** is responsible for generating **unique, collision-free IDs** used for creating short URLs.

It is designed to be:

* Extremely fast
* Highly reliable
* Simple and efficient

---

## 🧩 Responsibilities

* Generate unique ID ranges
* Ensure no duplication across the system
* Provide high-throughput ID allocation to URL Service

---

## ⚙️ How It Works

### ID Generation Strategy

* Uses a **global counter in Redis**
* IDs are generated using **atomic increment (`INCRBY`)**

---

### Batch Allocation

* Each request returns a **range of IDs (batch)**

```json
{
  "start": 1001,
  "end": 4000
}
```

* Default batch size: **3000 IDs**

---

### Why Batching?

* Reduces network calls
* Improves performance
* Avoids latency during URL creation

---

## 🔐 Safety Mechanism (Important)

### Startup Jump Strategy

On service startup:

* Reads current counter value
* Jumps forward by a fixed size (`JUMP_SIZE = 1000`)

Example:

```
Previous value: 5000  
New value: 6000  
```

### Why This Matters

* Prevents duplicate IDs after crashes/restarts
* Ensures previously issued IDs are never reused

---

## 🛢️ Redis Setup

### Deployment

* 1 Redis Primary
* (Optional replica for redundancy)

---

### Persistence Configuration

Redis is configured for **strong durability**:

```conf
appendonly yes
appendfsync always
save ""
```

### What This Means

* Every write is persisted to disk (**AOF mode**)
* No reliance on in-memory only storage
* Survives pod restarts or temporary failures

---

### Storage

* Uses **Persistent Volume (PVC)**
* Data stored in `/data`
* Ensures durability across container restarts

---

## 🔄 Reliability Strategy

* Atomic operations via Redis (`INCRBY`)
* Persistent storage (AOF + PVC)
* Safe restart handling (jump strategy)

---

## 🌐 API Endpoint

### Generate ID Range

**POST** `/api/id-gen/next-range`

#### Response:

```json
{
  "start": number,
  "end": number
}
```

---

## ⚡ Performance Characteristics

* O(1) ID generation
* No locking required
* Handles high concurrency easily
* Minimal latency due to batching

---

## ⚖️ Design Decisions

### Why Redis?

* Atomic operations
* Extremely fast
* Simple to manage

---

### Why Not Distributed ID Generators (UUID, Snowflake)?

* UUID → too large for short URLs
* Snowflake → more complex than needed

---

### Why Persistence in Redis?

* This is **not user-facing**, but critical
* Losing counter state = risk of ID collisions
* Hence:

  * AOF enabled
  * Disk-backed storage used

---

## 📌 Summary

* 🔢 Generates unique IDs using Redis atomic counters
* ⚡ Uses batching for high performance
* 🛡️ Prevents duplication via startup jump strategy
* 💾 Ensures durability with AOF + PVC

---

> A simple but critical service that guarantees uniqueness and performance across the system.
