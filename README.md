# 🌾 BharatFarm — Enterprise AgriTech & Rural Development Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)

**BharatFarm** is a production-ready, modular AgriTech platform engineered for smallholder farmers, Agri-FPOs (Farmer Producer Organizations), and agricultural administrators. Developed for the **Smart India Hackathon (SIH)**, BharatFarm combines hyper-local climate intelligence, AI-driven crop diagnostics, smart mandi price risk forecasting, parametric insurance verification, and a multi-channel WhatsApp AI assistant (Sahayak) into an accessible, multilingual web and mobile experience.

---

## 🌟 Key Platform Highlights

- **Dual-Tier Architecture**: Combines everyday **Basic Farmer Needs** tools (weather, marketplace, group buying, disease scanner) with the **SIH Advanced Intelligence Suite** (climate risk, mandi price forecasting, parametric insurance).
- **Multilingual Support**: Built-in internationalization engine supporting **English (`en`)**, **Hindi (`hi`)**, and **Bengali (`bn`)** across all modules.
- **Multi-Channel Sahayak AI**: Conversational assistant available on the web and integrated with WhatsApp via a stateful backend engine (`WhatsAppStateMachine`).
- **Offline & Mock Mode Support**: Zero external dependency requirement during testing or offline environments using `USE_MOCK_DATA=true`.
- **JWT & Supabase Authentication**: Persistent 7-day JWT authentication ensuring seamless session persistence across app re-opens.
- **Mobile-First Responsive Design**: Optimized mobile touch interfaces (`MobileBasicFarmerHome`, `MobileSahayakView`, `MobileClimateRiskView`, `MobileSmartMandiView`).

---

## 🏗️ Project Architecture & Directory Structure

BharatFarm uses an npm workspaces monorepo structure with strict client-server separation, database migrations, and a shared type safety contract layer.

```text
BharatFarm/
├── client/                     # React 18 + Vite + TypeScript Frontend
│   ├── public/                 # Web assets (logo, favicons, PWA icons)
│   ├── src/
│   │   ├── app/                # Application routes & layout
│   │   ├── components/         # Reusable UI components & mobile views
│   │   ├── context/            # Global contexts (Auth, Language)
│   │   ├── core/               # Base API client & HTTP interceptors
│   │   ├── modules/
│   │   │   ├── basic-farmer-needs/ # Basic farmer tools (Weather, Marketplace)
│   │   │   └── sih/            # Advanced AI suite (Climate, Mandi, Sahayak)
│   │   ├── styles/             # CSS design system & glassmorphism theme
│   │   └── translations/       # Multilingual dictionaries (en, hi, bn)
│   ├── index.html              # Frontend HTML entrypoint
│   ├── package.json            # Client dependencies & scripts
│   └── vite.config.ts          # Vite builder & proxy configuration
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment, Supabase, and JWT config
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # Auth verification middleware
│   │   ├── modules/
│   │   │   └── sahayak/        # WhatsApp state machine & handlers
│   │   ├── routes/             # Express API route endpoints
│   │   ├── services/           # Business logic & AI integrations
│   │   └── utils/              # API envelopes & JWT helpers
│   ├── package.json            # Server dependencies & scripts
│   └── tsconfig.json           # Server TypeScript settings
│
├── shared/                     # Shared TypeScript library (@bharatfarm/shared)
│   ├── src/
│   │   ├── constants/          # Shared system constants & API status codes
│   │   └── types/              # Domain models (Auth, CropRisk, Insurance)
│   ├── package.json            # Shared library configuration
│   └── tsconfig.json           # Shared library build settings
│
├── supabase/                   # Supabase database setup
│   └── migrations/             # SQL schema migrations & RLS policies
│
├── docs/                       # Technical & architectural documentation
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
├── package.json                # Root npm workspace configuration
├── package-lock.json           # Locked dependency tree
└── README.md                   # Workspace platform documentation
```

---

## 🚀 Module Overview

### 1. Basic Farmer Needs Suite (`client/src/modules/basic-farmer-needs`)

| Feature Module | Key Capabilities |
| :--- | :--- |
| **🌤️ Weather & Advisory** | Hyperlocal 7-day weather forecasts, agricultural spray window recommendations, micro-climate risk alerts. |
| **📷 Leaf Disease Scanner** | AI-powered crop leaf disease diagnostic tool providing instant disease identification, severity score, and organic/chemical remedies. |
| **🛒 Agri-Marketplace** | Direct peer-to-peer buying and selling of crops, farming equipment, organic fertilizers, and quality seeds. |
| **👥 Group Buying** | Input pooling platform allowing neighboring farmers to consolidate orders for seeds and fertilizers to unlock wholesale discounts. |
| **📜 Schemes & Subsidies** | Government scheme aggregator (PM-Kisan, PMFBY) with instant eligibility checking and application tracking. |
| **🧮 Farm Calculator & Records**| Farm expense and yield estimator, loan interest calculator, and digital crop journal for farm record keeping. |
| **🤖 KrishiBot** | Voice-enabled conversational AI assistant for instant farming query resolution. |

### 2. SIH Advanced Intelligence Suite (`client/src/modules/sih`)

| Feature Module | Key Capabilities |
| :--- | :--- |
| **🌍 Climate Risk Intelligence** | Regional heat stress maps, flood and drought risk vulnerability scoring, food security dashboards, and best work windows. |
| **📈 Smart Mandi Price & Risk** | Real-time mandi price trends, price volatility risk ratings, optimal selling timeframe predictions, and nearest market locator. |
| **💬 Sahayak AI (WhatsApp & Web)**| Multi-channel AI assistant powered by a state machine supporting step-by-step guidance, audio responses, and a live web simulator modal. |
| **🛡️ Crop Risk & Insurance** | Parametric crop insurance eligibility evaluator, satellite-backed damage simulation, and claim tracking interface. |
| **🚚 Aggregation Optimizer** | Route planning and logistics load optimization engine for Farmer Producer Organizations (FPOs). |
| **📋 Action Planner** | Seasonal task checklists, crop calendar milestone tracking, and daily farm action management. |
| **🗺️ Field Mapping** | Interactive plot boundary mapping and soil health parameter visualization. |

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Framework**: React 18, TypeScript, Vite
- **Routing**: React Router v6
- **Styling**: Custom Vanilla CSS Design System with Glassmorphism aesthetic & dark mode support
- **PWA**: Workbox Service Workers, Web Push Notifications, Offline Caching
- **Internationalization**: Lightweight custom i18n engine with English, Hindi, and Bengali dictionaries

### Backend (`/server`)
- **Runtime**: Node.js, Express, TypeScript (`tsx` for hot-reload development)
- **Authentication**: JWT (`jsonwebtoken`) with 7-day expiration + Supabase Auth fallback
- **Messaging Engine**: Custom WhatsApp Bot State Machine (`whatsappStateMachine.service.ts`)
- **AI Engine**: Google Gemini / OpenRouter API integration for automated agricultural consultations
- **Push Notifications**: Web-Push VAPID protocol for real-time risk alerts

### Shared Core (`/shared`)
- **Build Tooling**: `tsup` bundle generator
- **Type Safety**: Unified domain models (`AuthUser`, `ApiResponse`, `CropRiskAlert`, `MandiPrice`, `InsuranceClaim`) shared between client and server.

---

## ⚙️ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/The-Lazy-Four/BharatFarm.git
   cd BharatFarm
   ```

2. **Install workspace dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` in the root workspace directory:
   ```bash
   cp .env.example .env
   ```

4. **Build the Shared Contract Package**:
   ```bash
   npm run build --prefix shared
   ```

5. **Start Development Servers**:
   Run both client and server concurrently in hot-reload development mode:
   ```bash
   npm dev
   ```

   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3000`
   - **Health Endpoint**: `http://localhost:3000/api/health`

---

## 📡 API Architecture & Key Endpoints

All server API responses are formatted using a standardized JSON envelope (`ApiResponse<T>`):

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Core Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint returning server status & timestamp |
| `/api/auth/register` | `POST` | Register a new farmer/user and return JWT access token |
| `/api/auth/login` | `POST` | Authenticate user and return JWT access token |
| `/api/auth/me` | `GET` | Validate JWT session token and return user profile |
| `/api/climate-risk/data` | `GET` | Retrieve regional climate risk scores and advisory |
| `/api/smart-mandi/prices` | `GET` | Fetch real-time commodity prices and volatility forecasts |
| `/api/crop-risk/assess` | `POST` | Evaluate parametric crop damage risks |
| `/api/insurance/policies` | `GET` | List available crop insurance schemes and eligibility |
| `/api/ai/query` | `POST` | Process AI farming advisory questions via Gemini/OpenRouter |

---

## 🌐 Deployment Guidelines

- **Render**: The project is pre-configured for Render.
  - Set build command: `npm install && npm run build --prefix shared && npm run build --prefix server && npm run build --prefix client`
  - Set start command: `npm start --prefix server`
  - Add optional `JWT_SECRET` environment variable in Render dashboard for custom key signing.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
