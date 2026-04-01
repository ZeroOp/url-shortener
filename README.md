# ZeroOp URL Shortener 🚀
**A high-performance, distributed, and event-driven URL shortening platform.**

This project is built to handle massive scale using a microservices architecture, featuring real-time analytics, automated link expiration, and high-availability database clustering.

---

## 🏗️ System Architecture
The system is composed of several independent services communicating over an asynchronous event bus (NATS).

![System Architecture](./docs/Images/architecture.png)

---

## 📂 Documentation Modules
Click on the links below to dive into the technical details of each component:

| Service / Module | Description | Link |
| :--- | :--- | :--- |
| **Architecture** | High-level design, data flow, and trade-offs. | [Read Docs](./architecture.md) |
| **Auth Service** | Identity management and JWT-based security. | [Read Docs](./auth-service.md) |
| **URL Service** | The core redirection engine and link management. | [Read Docs](./url-service.md) |
| **Counter Service** | Distributed ID generation for short codes. | [Read Docs](./counter-service.md) |
| **Analytics Service** | ClickHouse-powered real-time tracking and MVs. | [Read Docs](./analytics-service.md) |
| **Expiration Service** | TTL management and automated link cleanup. | [Read Docs](./expiration.md) |
| **Database Layer** | MongoDB & ClickHouse cluster configurations. | [Read Docs](./database.md) |

---

## 🚀 Quick Start (Local Development)
1. **Prerequisites:** Docker, Kubernetes (minikube/kind), and Helm.
2. **Setup Cluster:** `kubectl apply -f ./k8s`
3. **Initialize Databases:** See the [Database Docs](./database.md) for ClickHouse migrations.

---

## 🛠️ Technology Stack
- **Languages:** TypeScript (Node.js), Angular (Frontend).
- **Communication:** NATS Streaming (Event Bus), gRPC/REST.
- **Databases:** MongoDB (Metadata), Redis (Cache), ClickHouse (Analytics).
- **Orchestration:** Kubernetes, Docker, Ingress-Nginx.