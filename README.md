# Loop — Shared Accountability App

Loop is a shared accountability app where small trusted groups (families, roommates, friends) keep each other on track with daily habits, medicines, chores, and shared expenses through one-tap check-ins and real-time nudges.

Designed from the ground up for extreme accessibility, calm visual hierarchy, and elderly user friendliness.

---

## Architecture Overview

```
Loop_App/
├── shared/           # @loop/shared (TypeScript) - Design tokens, socket event contracts, domain types
├── server/           # @loop/server (Node.js 20+ ESM) - Express, Socket.io, MongoDB, Redis, BullMQ
├── web/              # @loop/web (React + Vite + Tailwind CSS)
├── mobile/           # @loop/mobile (React Native CLI bare workflow)
├── docs/             # ACCESSIBILITY.md, DEPLOYMENT.md
├── docker-compose.yml# Local dev infrastructure (Node, MongoDB, Redis)
└── .github/          # CI/CD workflows
```

---

## Design System & Tokens
- **Design Tokens**: Defined in [`shared/src/designTokens.ts`](file:///e:/Loop_App/shared/src/designTokens.ts).
- **Socket Contracts**: Defined in [`shared/src/socketEvents.ts`](file:///e:/Loop_App/shared/src/socketEvents.ts).
- **Accessibility Guidelines**: Read [`docs/ACCESSIBILITY.md`](file:///e:/Loop_App/docs/ACCESSIBILITY.md).

---

## Server Setup & Running Locally

### Prerequisites
- Node.js 20+
- MongoDB and Redis (or Docker)

### Starting with Docker Compose:
```bash
docker-compose up -d
```

### Running Server Locally (Bare Metal):
```bash
# 1. Install dependencies
npm install

# 2. Build shared types
npm run build:shared

# 3. Start development server
npm run dev:server
```

### Running Tests:
```bash
npm run test:server
```
