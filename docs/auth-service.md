# 🔐 Auth Service

## 📌 Overview

The **Auth Service** is responsible for user authentication and identity management in the ZeroOp platform.

It provides **basic email/password authentication** and issues **JWT-based sessions** that are shared across all services.

> ⚠️ Note: Email verification, user blocking, and advanced security features are intentionally **out of scope** for this project.

---

## 🧩 Responsibilities

* User signup & signin
* JWT generation and validation
* Session management using cookies
* Providing user identity to other services

---

## 🔑 Authentication Flow

### Signup / Signin

1. User provides email & password
2. User data stored in **MongoDB**
3. A **JWT token** is generated
4. JWT is stored inside a **cookie-session**
5. Cookie is sent back to the client

---

### Request Authentication

* Incoming requests contain the cookie
* JWT is extracted and verified using:

  * **Secret from Kubernetes Secrets (env variables)**

---

## 🍪 Session Management

* Uses **cookie-session**
* JWT is stored inside cookies (not local storage)
* Ensures:

  * Stateless authentication
  * Easy sharing across services

---

## 🔄 Shared Authentication (Important Design Choice)

To avoid tight coupling in microservices:

* Auth logic is extracted into a shared package:
  **`@zeroop-dev/common`**

### Middlewares

#### `currentUser`

* Extracts JWT from cookie
* Verifies token
* Attaches decoded user to:

  ```ts
  req.currentUser
  ```

#### `requireAuth`

* Checks if `req.currentUser` exists
* If yes → continue request
* If no → throws **Not Authorized error**

---

### ✅ Why This Design?

* No service-to-service dependency on Auth Service
* Each service can independently verify users
* Improves scalability and reliability

---

## 🛢️ Database Design (MongoDB)

### Cluster Setup

* 3-node **MongoDB Replica Set**

  * 1 Primary
  * 2 Secondary

---

### Write Strategy

* Writes are acknowledged only after:

  * Data is written to **at least 2 nodes**
* Ensures strong durability

---

### Read Strategy

* All reads are performed from **Primary**
* Primary replicates data to secondaries

---

### Failover (Election)

* If Primary goes down:

  * Election is triggered
  * Requires **majority (2/3 nodes)** to elect new primary
* Ensures high availability

---

## 🌐 API Routes

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| POST   | `/api/user/signup`      | Register a new user        |
| POST   | `/api/user/signin`      | Login user                 |
| POST   | `/api/user/signout`     | Logout user                |
| GET    | `/api/user/currentUser` | Get current logged-in user |

---

## 🚫 Scope Limitations

* No email verification
* No password reset
* No account blocking
* No OAuth/social login

---

## 📌 Summary

* 🔐 JWT-based authentication via cookies
* 🔄 Stateless & shared auth across services
* 🧱 MongoDB replica set for reliability
* 🚀 No dependency on Auth Service for validation

---

> This service is intentionally kept simple to focus on distributed system design rather than full-fledged auth features.
