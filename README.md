# GrandTix — Distributed Event Ticket Booking System

> A production-grade distributed ticketing platform built with the MERN stack, demonstrating core distributed systems concepts including load balancing, fault tolerance, logical clocks, and distributed mutual exclusion.

---

## Table of Contents

- [Overview](#overview)
- [Distributed Systems Concepts Covered](#distributed-systems-concepts-covered)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Distributed Simulation](#distributed-simulation)
- [Project Structure](#project-structure)
- [Syllabus Mapping](#syllabus-mapping)

---

## Overview

GrandTix is a full-stack distributed event ticketing system that simulates how large-scale platforms like BookMyShow or Ticketmaster handle thousands of concurrent booking requests. The system is designed to demonstrate real-world distributed computing challenges — including race conditions during concurrent seat booking, node failures, and load distribution across multiple worker nodes.

The core challenge this system solves: **How do you ensure no two users book the same seat simultaneously, even when requests hit different servers at the same time?**

---

## Distributed Systems Concepts Covered

### 1. Load Balancing
Three load balancing strategies are implemented for distributing booking requests across worker nodes:

- **Round Robin** — Cycles through nodes sequentially, ensuring equal distribution
- **Least Connections** — Routes each request to the node with the fewest active requests
- **Weighted Random** — Assigns probability weights inversely proportional to node load

### 2. Fault Tolerance & Process Resilience
- A **heartbeat-based fault detector** runs every 5 seconds, simulating real-world node health monitoring
- Nodes have a 10% chance of failure per heartbeat cycle and a 70% chance of self-recovery
- If a worker node fails mid-operation, the system detects it and routes subsequent requests to healthy nodes
- **No single point of failure** — the system continues operating in a degraded state when nodes go down

### 3. Logical Clocks (Lamport Clocks)
- Every booking event is timestamped using a **Lamport Logical Clock**
- The clock ticks on every local event and synchronizes on message receipt using `max(local, received) + 1`
- This ensures a consistent global ordering of booking events across distributed nodes without requiring synchronized physical clocks

### 4. Distributed Mutual Exclusion
- Seat booking uses **MongoDB ACID transactions** to enforce mutual exclusion
- The `findOneAndUpdate` with `$inc` operator performs an **atomic compare-and-decrement** — preventing two concurrent requests from booking the same seat
- This is equivalent to a token-based mutual exclusion mechanism at the database layer

### 5. Replication & Consistency
- MongoDB Atlas provides **multi-region replication** with automatic failover
- Write operations use `w: majority` to ensure bookings are confirmed only after being written to a majority of replicas
- The system demonstrates **strong consistency** for booking operations (no two users can book the same seat)

### 6. Middleware & API Gateway
- The Express backend acts as a **middleware layer** between the React frontend and the distributed worker nodes
- An **API Gateway pattern** is implemented — all client requests enter through a single endpoint which then routes to the appropriate service

### 7. Concurrency Simulation
- The `/api/distributed/simulate/concurrent` endpoint fires `N` simultaneous booking requests using `Promise.all`
- This simulates a real-world high-traffic scenario (like when a popular concert goes on sale) and demonstrates how the load balancer distributes requests and how mutual exclusion prevents overbooking

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Vite + Tailwind CSS)                       │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────┐
│               Express API Gateway                        │
│                  (Port 5001)                             │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Auth       │  │  Events      │  │  Distributed   │  │
│  │  Service    │  │  Service     │  │  Controller    │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Load Balancer                        │   │
│  │   Round Robin │ Least Connections │ Weighted      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │  Node 1  │    │  Node 2  │    │  Node 3  │           │
│  │ :3001    │    │ :3002    │    │ :3003    │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Fault Detector (Heartbeat every 5s)              │   │
│  │  Lamport Logical Clock                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas                               │
│   (Replicated, Multi-region, ACID Transactions)          │
│                                                          │
│   Collections: users │ events │ bookings                 │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (JSON Web Tokens), bcryptjs |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Dev Tools | Nodemon, Concurrently |

---

## Features

### User Features
- Register and login with JWT authentication
- Browse all upcoming events with real-time seat availability
- Search and filter events by name, venue, or category
- Book tickets with choice of load balancing strategy
- View booking confirmation code after successful booking
- Cancel bookings (seats are automatically released back)
- View all personal booking history

### Admin Features
- Full admin dashboard with 3 tabs
- **System Status tab** — live view of all 3 worker nodes, their health, request count, and last heartbeat. Kill or recover any node in real time
- **All Bookings tab** — view every booking in the system across all users
- **Simulate tab** — trigger N concurrent booking requests and observe how the load balancer distributes them across nodes

### Distributed Features
- Real-time node health monitoring via heartbeat
- Three pluggable load balancing strategies
- Lamport logical clock timestamping on every booking
- Atomic seat booking using MongoDB transactions
- Concurrent booking simulation with result analytics

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/grandtix.git
cd grandtix

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file inside the `/backend` directory:

```env
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ticketbooking?retryWrites=true&w=majority
JWT_SECRET=yoursecretkey123
NODE_ENV=development
```

### Running the Application

```bash
# Terminal 1 — Start backend
cd backend
npm run dev

# Terminal 2 — Start frontend
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

### Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@ticketapp.com | admin123 |
| User | Register via UI | — |

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Events
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/events` | Get all active events | No |
| GET | `/api/events/:id` | Get event by ID | No |
| GET | `/api/events/search` | Search events | No |
| POST | `/api/events` | Create event | Admin |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Cancel event | Admin |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/bookings` | Book tickets | Yes |
| GET | `/api/bookings` | Get my bookings | Yes |
| GET | `/api/bookings/:id` | Get booking by ID | Yes |
| PUT | `/api/bookings/:id/cancel` | Cancel booking | Yes |
| GET | `/api/bookings/all` | Get all bookings | Admin |

### Distributed
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/distributed/status` | Get node status + logical clock | No |
| POST | `/api/distributed/book` | Book with load balancer | Yes |
| POST | `/api/distributed/simulate/failure` | Kill a node | Admin |
| POST | `/api/distributed/simulate/recovery` | Recover a node | Admin |
| POST | `/api/distributed/simulate/concurrent` | Run concurrent simulation | Admin |
| POST | `/api/distributed/reset` | Reset all nodes | Admin |

---

## Distributed Simulation

The most powerful feature for demonstrating distributed systems concepts.

### Running a Concurrent Simulation

```bash
# Login as admin first and get token
curl -X POST http://localhost:5001/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"admin@ticketapp.com","password":"admin123"}'

# Run 10 concurrent booking requests
curl -X POST http://localhost:5001/api/distributed/simulate/concurrent \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{"eventId":"<eventId>","numberOfRequests":10}'
```

### Simulating Node Failure and Recovery

```bash
# Kill node-2
curl -X POST http://localhost:5001/api/distributed/simulate/failure \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{"nodeId":"node-2"}'

# Check system status — node-2 should show "failed"
curl http://localhost:5001/api/distributed/status

# Recover node-2
curl -X POST http://localhost:5001/api/distributed/simulate/recovery \
-H "Authorization: Bearer <token>" \
-d '{"nodeId":"node-2"}'
```

---

## Project Structure

```
grandtix/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.js              # MongoDB Atlas connection
│       │   └── seedData.js        # Initial data seeder
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── eventController.js
│       │   ├── bookingController.js
│       │   └── distributedController.js
│       ├── middleware/
│       │   └── auth.js            # JWT protect + adminOnly
│       ├── models/
│       │   ├── User.js
│       │   ├── Event.js
│       │   └── Booking.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── eventRoutes.js
│       │   ├── bookingRoutes.js
│       │   └── distributedRoutes.js
│       ├── utils/
│       │   ├── nodeRegistry.js       # Worker node management
│       │   ├── loadBalancer.js       # 3 LB strategies
│       │   ├── faultDetector.js      # Heartbeat monitor
│       │   ├── logicalClock.js       # Lamport clock
│       │   └── generateToken.js
│       ├── app.js
│       └── server.js
│
└── frontend/
    └── src/
        ├── api/
        │   └── axios.js              # Axios instance + interceptor
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── EventCard.jsx
        │   └── BookingCard.jsx
        ├── context/
        │   └── AuthContext.jsx       # Global auth state
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── EventDetailPage.jsx
            ├── MyBookingsPage.jsx
            └── AdminDashboardPage.jsx
```

---

## Syllabus Mapping

| Unit | Topic | Implementation |
|---|---|---|
| 1.1 | Need & Goals of Distributed Systems | Concurrent booking problem, multi-node architecture |
| 1.2 | Types — Cloud Computing | MongoDB Atlas (cloud-managed DB) |
| 1.3 | Middleware, API Gateways | Express API Gateway, route middleware |
| 2.2 | Message Oriented Communication | Async booking queue via Promise.all |
| 3.1 | Logical Clocks | Lamport clock in logicalClock.js |
| 3.1 | Bully Election (conceptual) | Leader node selection in load balancer |
| 3.2 | Mutual Exclusion | MongoDB atomic transactions for seat booking |
| 4.1 | Load Balancing | Round Robin, Least Connections, Weighted Random |
| 4.2 | Process Management | Node registry, request routing |
| 5.1 | Replication & Consistency | MongoDB Atlas replication, strong consistency |
| 5.2 | Fault Tolerance | Heartbeat detector, node failure/recovery simulation |
| 6.2 | Distributed Storage | MongoDB Atlas as distributed data store |

---

## References

1. Tanenbaum, A. S., & Van Steen, M. — *Distributed Systems: Principles and Paradigms*
2. Kleppmann, M. — *Designing Data-Intensive Applications*
3. MongoDB Documentation — Transactions and Replication
4. Lamport, L. (1978) — *Time, Clocks, and the Ordering of Events in a Distributed System*
5. NGINX Load Balancing Documentation
