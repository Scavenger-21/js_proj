# APIForge 🛠️

APIForge is a modern, full-stack, commercial-grade API testing, debugging, analytics, and diagnostics platform. It is designed to feel like a high-performance SaaS product, drawing inspiration from Postman, Insomnia, Linear, Stripe Dashboard, and Vercel.

APIForge enables developers to build and execute HTTP requests, inspect detailed response metrics, view real-time diagnostics for failing requests, monitor endpoint security posture, and audit service health scores.

---

## Key Features

- **Robust Request Builder**: Full support for HTTP methods (GET, POST, PUT, DELETE, etc.), headers, query parameters, and interactive body editing using the Monaco Editor.
- **Deep Response Insights**: Real-time response sizes, request durations, and interactive JSON payload inspections.
- **Smart Diagnostics Engine**: Auto-analyzes failed or error responses (HTTP 4xx/5xx) and uses a multi-factor rule engine to determine the likely root causes and list prioritized actionable fixes.
- **Security Posture Analysis**: Scans requests and responses for insecure transport protocols (HTTP), missing auth mechanisms, sensitive tokens leaked in URLs, and suspicious or missing security headers.
- **Real-Time Analytics**: Built-in interactive dashboard showcasing request volumes, average latency percentiles (P50, P75, P90, P95, P99), success vs. failure ratios, and endpoint traffic distributions.
- **Endpoint Health Monitor**: Continuous reliability scoring for endpoints using historical data to calculate success rates, failure frequencies, and latency grades.

---

## System Architecture

APIForge is built as a TypeScript monorepo with the following design:

```
                      ┌──────────────────────┐
                      │    Client (NextJS)   │
                      └──────────┬───────────┘
                                 │ Proxies API calls
                                 ▼
                      ┌──────────────────────┐
                      │   Fastify REST API   │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Proxy Engine   │    │  Database (DB)   │    │  Services Layer  │
│ (SSRF-Protected) │    │  SQLite / Prisma │    │  - Analytics     │
└────────┬─────────┘    └──────────────────┘    │  - Diagnostics   │
         │                                      │  - Security      │
         ▼                                      │  - Health        │
   External APIs                                └──────────────────┘
```

- **Frontend**: Next.js (App Router), styled with Tailwind CSS, using Zustand for state management, Framer Motion for premium animations, and TanStack Query v5 for server synchronization.
- **Backend**: Fastify API, offering extremely low overhead, schema validation via Zod, and database connection pools managed via Prisma ORM.
- **Shared Package**: Typed interfaces and schemas shared between front-end and back-end to ensure compile-time safety across the entire stack.
- **Database**: Zero-dependency local SQLite file storage by default. Ready to scale to PostgreSQL.

---

## Local Quick Start

Follow these steps to run APIForge locally on your machine:

### 1. Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Install Dependencies

In the root of the project, run:

```bash
npm install
```

### 3. Database Sync

Create the local SQLite database and apply schemas:

```bash
npm run db:push
```

### 4. Run Development Servers

Start both Fastify backend (on `http://localhost:3001`) and Next.js frontend (on `http://localhost:3000`):

```bash
npm run dev
```

---

## Project Structure

```
apiforge/
├── apps/
│   ├── frontend/                    # Next.js 14 Web Application
│   │   ├── src/app/                 # App Router Pages (/workspace, /analytics, etc.)
│   │   ├── src/components/          # Request Builder, Response Viewer, Charts, UI
│   │   └── src/store/               # Zustand Global State
│   └── backend/                     # Fastify REST Service
│       ├── src/routes/              # API endpoints for Proxy, History, Analytics
│       └── src/services/            # SSRF Proxy, Diagnostics Engine, Health Scoring
├── packages/
│   └── shared/                      # Shared Types & Schemas
└── package.json                     # Monorepo Workspaces & Build Scripts
```

---

## Security Features

- **SSRF Prevention**: The backend proxy intercepts and blocks requests heading to localhost, private subnets (e.g., `10.0.0.0/8`, `192.168.0.0/16`), and metadata endpoints (e.g., `169.254.169.254`).
- **Response Size Safety Cap**: Prevents server memory issues by dropping responses larger than 10MB.
- **Request Isolation**: Safe header scrubbing and timeouts configured to abort external hung connections.
