# BharatFarm — Production-Ready Modular Architecture Scaffolding

## Smart India Hackathon Ecosystem

BharatFarm is an enterprise AgriTech and rural-development platform engineered with a **Modular Domain-Driven Architecture + Feature-Based Architecture + Client/Server Separation**.

---

## 1. Root Directory Structure

```text
bharatfarm/
├── client/          # React + Vite + TypeScript Frontend
├── server/          # Node.js + Express + TypeScript Backend
├── shared/          # Shared TypeScript contracts, interfaces & constants
├── docs/            # Platform architectural documentation
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── LICENSE
```

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, TypeScript, React Router v6, Vanilla CSS Design System (Glassmorphic dark aesthetic).
- **Backend**: Node.js, Express, TypeScript, REST API, Centralized Error Handling, Supabase Abstraction Layer.
- **Shared**: Cross-platform interfaces and types built with `tsup`.

---

## 3. Feature Modules Overview & Developer Ownership

| Feature Module | Purpose | Frontend Location | Backend Location | Developer Lead |
| :--- | :--- | :--- | :--- | :--- |
| **KrishiBot** | Multilingual AI Farmer Assistant | `client/src/features/krishibot` | `server/src/modules/krishibot` | Developer C |
| **Scanner** | Leaf Disease AI Diagnostic | `client/src/features/scanner` | `server/src/modules/scanner` | Developer A |
| **Marketplace** | Direct Agri-Commerce (B2B/D2C) | `client/src/features/marketplace` | `server/src/modules/marketplace` | Developer B |
| **Weather** | Hyperlocal Weather & Advisory | `client/src/features/weather` | `server/src/modules/weather` | Developer D |
| **Group Buying** | Wholesale Input Order Pooling | `client/src/features/groupbuying` | `server/src/modules/groupbuying` | Developer E |
| **Schemes** | Gov Subsidies & Credit Assessment | `client/src/features/schemes` | `server/src/modules/schemes` | Developer F |

---

## 4. Architectural Principles

1. **Feature Encapsulation**: Every feature owns its `components/`, `pages/`, `hooks/`, `services/`, `controllers/`, `repositories/`, `types/`, and `mock/`. Cross-feature logic is prohibited.
2. **Database Abstraction**: Backend services talk to `Repository` classes. Supabase/PostgreSQL queries are isolated inside repositories, enabling zero-code changes in services during database migrations.
3. **Offline & Mock Readiness**: The system runs seamlessly without external API keys using `USE_MOCK_DATA=true`.

---

## 5. Development Setup

```bash
# Install dependencies across workspaces
npm install

# Build shared contracts
npm run build --prefix shared

# Build server and client
npm run build --prefix server
npm run build --prefix client

# Run both Client & Server concurrently in development mode
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`
- **Health Endpoint**: `http://localhost:5000/api/health`
