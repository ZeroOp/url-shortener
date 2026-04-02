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
| **Architecture** | High-level design, data flow, and trade-offs. | [Read Docs](./docs/architecture.md) |
| **Auth Service** | Identity management and JWT-based security. | [Read Docs](./docs/auth-service.md) |
| **URL Service** | The core redirection engine and link management. | [Read Docs](./docs/url-service.md) |
| **Counter Service** | Distributed ID generation for short codes. | [Read Docs](./docs/counter-service.md) |
| **Analytics Service** | ClickHouse-powered real-time tracking and MVs. | [Read Docs](./docs/analytics-service.md) |
| **Expiration Service** | TTL management and automated link cleanup. | [Read Docs](./docs/expiration.md) |
| **Database Layer** | MongoDB & ClickHouse cluster configurations. | [Read Docs](./docs/database.md) |

---
## 🛠️ Tech Stack & Prerequisites

### 1. Local Development Tools (Install these first)
* **Docker & Kubernetes** (minikube/kind) - Container orchestration.
* **Node.js** - Runtime for Backend services.
* **Angular** - Frontend Framework.

### 2. Infrastructure & Middleware (Running in Cluster)
* **NATS Streaming Server** - High-performance event bus for asynchronous communication.
* **Redis Cluster** - Distributed caching and ID generation (Counter Service).
* **BullJS** - Distributed queue management for link expiration logic.
* **MongoDB Cluster** - Document storage for Users (Auth) and URL Mappings.
* **ClickHouse** - OLAP database for high-speed analytics and click-stream processing.

---
## 🚀 Quick Start (Local Development)

1. **Setup Cluster:**
   ```bash
   kubectl apply -f ./k8s
    ```
2. **Initialize Auth MongoDB Cluster:**
    ```bash
        kubectl exec -it mongo-0 -- mongod --eval 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "mongo-0.mongo:27017" }, { _id: 1, host: "mongo-1.mongo:27017" }, { _id: 2, host: "mongo-2.mongo:27017" }]})'
    ```
3. **Initialize URL MongoDB Cluster:**
    ```bash
    kubectl exec -it url-mongo-0 -- mongod --eval 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "url-mongo-0.url-mongo-srv:27017" }, { _id: 1, host: "url-mongo-1.url-mongo-srv:27017" }, { _id: 2, host: "url-mongo-2.url-mongo-srv:27017" }]})'```
4. **Initialize Redis Cluster:**
   Wait for all 8 pods to be `Running`, then execute the cluster creation command. This automatically assigns 4 Masters and 4 Replicas:
   ```bash
   kubectl exec -it redis-cluster-0 -- redis-cli --cluster create \
   $(kubectl get pods -l app=redis-cluster -o jsonpath='{range.items[*]}{.status.podIP}:6379 {end}') \
   --cluster-replicas 1 --cluster-yes
   ```
   ### 💡 Why Redis Initialization is a "Must":
    1. **Slot Assignment:** Redis Cluster divides data into 16,384 hash slots. Without the initialization command, 0 slots are assigned, and every `SET` or `GET` request from the URL Service will fail with a `CLUSTERDOWN` error.
    2. **High Availability:** Using `--cluster-replicas 1` ensures each of the 4 Masters has 1 Replica. If a master node (e.g., `redis-cluster-0`) fails, its replica automatically takes over.
    3. **Internal Gossip:** The initialization starts the "Gossip Protocol" on port `16379`, allowing nodes to monitor each other's health and state.

    > **Note for Local Setup:** Since the YAML uses `emptyDir: {}`, the cluster configuration in `/data` is wiped if you restart Docker Desktop or Minikube. You will need to re-run the initialization command in those cases.

5. **Initialize Databases:** See the [Database Docs](./database.md) for ClickHouse migrations.

6. **Access Application:**
   * **Update Hosts File:** Map `link.zeroop.dev` to `127.0.0.1` in your local hosts file (e.g., `/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`).
   * **URL:** [https://link.zeroop.dev/](https://link.zeroop.dev/)
   * **SSL/Cert Note:** Since this uses self-signed certs, if you see a "Connection is not private" warning in Chrome, simply type `thisisunsafe` anywhere on the browser window to bypass and access the dashboard.
---