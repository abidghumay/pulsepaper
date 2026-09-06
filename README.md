# 📑 PulsePaper – Automated Scientific Paper & Tech Article Dashboard

PulsePaper is a single, self-contained, responsive web application and ingestion service designed to deliver an effortless morning reading ritual. Every morning at **5:00 AM Asia/Dhaka**, the system automatically fetches preprints and articles from configured arXiv feeds and tech sources, normalizes and deduplicates them in PostgreSQL, and serves them via an intuitive dashboard on both desktop and mobile.

---

## 1. What the Project Does
- **Automated Daily Ingestion**: Runs a daily scheduled cron job at `05:00 AM (Asia/Dhaka)` to pull fresh research papers and tech articles.
- **Resilient Multi-Source Ingestion**: Fetches from arXiv (cs.AI, cs.LG, cs.CR), Hacker News, MIT Technology Review, and TechCrunch AI with isolated error boundaries.
- **Persistent Storage & Deduplication**: Stores articles in PostgreSQL with database-level URL uniqueness (`ON CONFLICT (url) DO NOTHING`).
- **Responsive Dashboard (PC & Mobile)**: Filter by Category, Unread, or Bookmarked/Saved items; search across titles, summaries, and authors.
- **One-Click Paper Access**: Immediate links to open original research papers and articles.
- **On-Demand AI & Extractive Summarization**: Generate concise, structured executive summaries using Google Gemini 2.5 Flash (free tier) with an automatic offline extractive NLP fallback if no API key is supplied.
- **$0 / Month Operation**: Designed exclusively for free-tier infrastructure.

---

## 2. Architecture

PulsePaper is designed as a **single monolithic full-stack application** with clean separation of responsibilities:

```
dash/
├── src/
│   ├── client/              # frontend/UI (React, Tailwind CSS, Lucide icons)
│   │   ├── components/      # Navbar, FilterBar, ArticleCard, DetailModal, SummaryModal, MobileNav
│   │   ├── App.tsx          # Main client application shell & state orchestration
│   │   └── main.tsx         # Client entry point
│   ├── server/              # backend/API (Express.js REST API & static serving)
│   │   └── index.ts         # Server boot, migrations trigger, and route handlers
│   ├── db/                  # database
│   │   ├── client.ts        # PostgreSQL connection (pg / PGlite WASM adapter)
│   │   ├── schema.sql       # Relational tables & optimization indexes
│   │   ├── migrate.ts       # Automated schema migration runner
│   │   └── repository.ts    # CRUD repository methods and deduplication logic
│   ├── sources/             # source configuration
│   │   ├── defaultSources.ts# Configured academic and tech feeds
│   │   └── types.ts         # Source definitions
│   ├── ingestion/           # ingestion/fetching
│   │   ├── fetcher.ts       # Resilient HTTP client with timeouts & custom User-Agent
│   │   ├── parser.ts        # RSS/Atom parser with sanitization & author normalization
│   │   └── pipeline.ts      # Multi-source pipeline with isolated error boundaries
│   ├── summarization/       # summarization
│   │   ├── gemini.ts        # Gemini 2.5 Flash API summarizer
│   │   ├── fallback.ts      # Offline extractive NLP summarizer (zero-secret fallback)
│   │   └── service.ts       # Unified summarization provider
│   └── scheduler/           # scheduled job
│       ├── cron.ts          # node-cron runner for 5:00 AM Asia/Dhaka
│       └── manual.ts        # Manual CLI execution runner (`npm run ingest`)
├── Dockerfile               # Multi-stage container build
├── render.yaml              # Render free-tier deployment specification
└── .env.example             # Documented environment variable template
```

---

## 3. Local Setup

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
git clone <repo-url>
cd dash
npm install
```

Copy the environment template:
```bash
cp .env.example .env
```

---

## 4. Database Setup

PulsePaper supports two modes:

### A. Zero-Friction Embedded Local Mode (Default)
If `DATABASE_URL` is empty in `.env`, PulsePaper automatically utilizes `@electric-sql/pglite` (an embedded, persistent WebAssembly build of PostgreSQL stored in `./.pgdata`).
* **Zero installation required**: No local PostgreSQL service or Docker needed.
* **100% PostgreSQL SQL dialect compatible**.

### B. Standard PostgreSQL / Cloud Mode
To connect to any local PostgreSQL instance or a free serverless cloud database (such as [Neon.tech](https://neon.tech)):
1. Create a database in Neon ($0/month free tier, 0.5 GB storage).
2. Set the connection string in `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@ep-cool-db.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Run the migrations:
   ```bash
   npm run migrate
   ```

---

## 5. Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `3001` | HTTP port for backend and static UI |
| `NODE_ENV` | Optional | `development` | `development` or `production` |
| `DATABASE_URL` | Optional | *empty (PGlite)* | PostgreSQL connection string (Neon / Render / local) |
| `CRON_SCHEDULE` | Optional | `0 5 * * *` | Cron expression for ingestion (default: 5:00 AM daily) |
| `CRON_TIMEZONE` | Optional | `Asia/Dhaka` | Timezone for the scheduled job |
| `GEMINI_API_KEY` | Optional | *empty* | Free Google AI Studio API key for Gemini 2.5 Flash |

---

## 6. How to Run Frontend & Backend

### Running in Production Mode (Single Process)
Build both client and server, then run the unified server:
```bash
npm run build
npm start
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### Running in Development Mode
Start the Vite dev server with hot reload:
```bash
npm run dev
```
In a second terminal, run the Express backend watcher:
```bash
npm run dev:server
```

---

## 7. How to Run Ingestion Manually

You can trigger feed ingestion at any time through three methods:

### Method 1: CLI Runner
```bash
npm run ingest
```
This runs migrations, fetches all active feeds, logs errors per source, deduplicates existing items, and prints a formatted summary table to your console.

### Method 2: UI Button
Click the **"Fetch Now"** button in the top navigation bar or the mobile navigation bar.

### Method 3: REST API
```bash
curl -X POST http://localhost:3001/api/ingest
```

---

## 8. How the 5 AM Scheduler Works

The scheduler is implemented using `node-cron` in `src/scheduler/cron.ts`.
- **Expression**: `0 5 * * *`
- **Timezone**: `Asia/Dhaka` (`UTC+6`)
- **Execution**: When the Express server boots (`startServer()`), `initDailyScheduler()` schedules the background job.
- At 05:00:00 AM Asia/Dhaka every day, `runIngestionPipeline()` is triggered automatically.
- Each source is fetched inside its own isolated try/catch block. If one source is offline or returns malformed XML, it records a failure in `ingestion_logs` and continues processing the remaining sources.

---

## 9. How to Add a New Source

Open `src/sources/defaultSources.ts` and add a new entry to `DEFAULT_SOURCES`:

```typescript
{
  id: 'nature-ai',
  name: 'Nature Machine Intelligence',
  url: 'https://www.nature.com/natmachintell.rss',
  category: 'Science & Bio',
  type: 'rss',
  enabled: true,
  description: 'Frontier research in machine intelligence and life sciences.'
}
```

Or add dynamically at runtime using the REST API:
```bash
curl -X POST http://localhost:3001/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "id": "nature-ai",
    "name": "Nature Machine Intelligence",
    "url": "https://www.nature.com/natmachintell.rss",
    "category": "Science & Bio",
    "enabled": true
  }'
```

---

## 10. How to Configure Summarization

PulsePaper includes a two-tier summarization engine:

1. **AI-Powered Summaries (Gemini 2.5 Flash)**:
   - Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
   - Add to `.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
   - Generates structured executive summaries with Core Contributions, Key Methodology, and Practical Implications.

2. **Offline Extractive Summarizer (Fallback)**:
   - If `GEMINI_API_KEY` is not provided or if the API encounters rate-limiting or network issues, PulsePaper automatically uses its built-in extractive NLP summarizer (`src/summarization/fallback.ts`).
   - Requires **$0**, no accounts, and works completely offline.

---

## 11. How to Deploy for $0/Month

### Option A: Render.com (Recommended $0/Month Stack)
1. **Database**: Create a free PostgreSQL instance on [Neon.tech](https://neon.tech) ($0/month forever). Copy the `DATABASE_URL`.
2. **Repository**: Push this repository to GitHub.
3. **Deploy on Render**:
   - Create a new **Web Service** on [Render.com](https://render.com).
   - Connect your GitHub repo.
   - Set Build Command: `npm install && npm run build`
   - Set Start Command: `npm start`
   - Add Environment Variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: *(Your Neon PostgreSQL URL)*
     - `CRON_SCHEDULE`: `0 5 * * *`
     - `CRON_TIMEZONE`: `Asia/Dhaka`
     - `GEMINI_API_KEY`: *(Your free Gemini key, optional)*
   - Click **Deploy Web Service**.

### Option B: Docker Container Deployment
Build and run the production container:
```bash
docker build -t pulsepaper .
docker run -p 3001:3001 -e DATABASE_URL="postgresql://..." pulsepaper
```

---

## 12. Verification & Test Suite

Run the automated test suite to verify all phases:

```bash
# 1. Test database migrations and CRUD operations (Phase 3)
npm run test:db

# 2. Test live feed ingestion and deduplication (Phases 4 & 5)
npm run test:ingest

# 3. Test on-demand summarization (Phase 8)
npm run test:summarize

# 4. Compile frontend & backend builds (Phase 2 & 9)
npm run build
```
