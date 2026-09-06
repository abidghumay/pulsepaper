# 📑 PulsePaper – Automated Scientific Paper & Tech Article Dashboard

PulsePaper is a single, self-contained, responsive web application and paper ingestion service designed for an effortless morning reading ritual. Every morning at **5:00 AM Asia/Dhaka**, the system automatically fetches research papers and articles from configured arXiv feeds and tech sources, normalizes and deduplicates them in PostgreSQL, and serves them via an intuitive dashboard on both desktop and mobile.

---

## 1. What the Project Does
- **Automated Daily Ingestion**: Scheduled daily cron job at `05:00 AM (Asia/Dhaka)` to pull fresh research papers and tech articles.
- **Resilient Multi-Source Ingestion**: Fetches from arXiv (cs.AI, cs.LG, cs.CR), Hacker News, MIT Technology Review, and TechCrunch AI with isolated per-source error boundaries.
- **Persistent Storage & Deduplication**: Relational storage in PostgreSQL with database-level URL uniqueness (`ON CONFLICT (url) DO NOTHING`).
- **Responsive Dashboard (PC & Mobile)**: Filter by Category, Unread, or Bookmarked/Saved items; search across titles, summaries, and authors.
- **Direct Paper Access**: Instant one-click links to original arXiv preprints and article sources.
- **On-Demand AI & Extractive Summarization**: Generate concise, structured executive summaries using Google Gemini 2.5 Flash free tier, with an automatic offline extractive NLP fallback if no API key is supplied.

---

## 2. Architecture

PulsePaper is built as a **single monolithic application** with clean separation of responsibilities:

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
├── package.json             # Unified dependencies & build scripts
└── .env.example             # Documented environment variables template
```

---

## 3. Prerequisites & Local Setup

### Prerequisites
- **Node.js**: `v20+` or `v24+` installed ([Download Node.js](https://nodejs.org/))
- **npm**: `v10+` (bundled with Node.js)
- **Git**

### Installation
1. Clone the repository or navigate to your project directory:
   ```bash
   cd dash
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Create your local environment file:
   ```bash
   cp .env.example .env
   ```

---

## 4. Database Setup

PulsePaper supports two database options:

### Option A: Zero-Setup Embedded PostgreSQL (Default & Recommended for Localhost)
If `DATABASE_URL` is left empty in `.env`, PulsePaper automatically utilizes `@electric-sql/pglite` (an embedded, persistent WebAssembly build of PostgreSQL stored in `./.pgdata`).
* **Zero installation required**: No PostgreSQL service, Docker, or native tools needed.
* **Fully persistent**: Articles, read status, bookmarks, and summaries are saved to disk in `.pgdata/`.
* **100% PostgreSQL compatible**: Runs standard PostgreSQL SQL, migrations, and indexes.

### Option B: External PostgreSQL (Local Postgres or Supabase)
If you prefer connecting to a local PostgreSQL instance or a remote database (e.g. Supabase):
1. Add your connection string to `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/dash_db
   ```
   *(Or your Supabase URI: `postgresql://postgres.xxxx:password@aws-0-....pooler.supabase.com:6543/postgres?sslmode=require`)*
2. Run migrations:
   ```bash
   npm run migrate
   ```

---

## 5. Manual Build on Localhost

PulsePaper includes dedicated build scripts for compiling both the React frontend and the TypeScript Express backend:

### 1. Build the Frontend (Vite + Tailwind CSS)
```bash
npm run build:client
```
* Compiles the React SPA, Tailwind CSS styles, and assets into the `dist/` directory.

### 2. Build the Backend (TypeScript Server)
```bash
npm run build:server
```
* Compiles the Express server, database layer, and ingestion engine into `dist/server/`.

### 3. Unified Production Build (Both Frontend & Backend)
```bash
npm run build
```
* Runs both `build:client` and `build:server` in sequence to produce a complete production-ready bundle.

---

## 6. Running on Localhost

### Mode 1: Production Mode (Single Process)
Run the compiled application as a single unified server serving both the REST API and the responsive web app:

```bash
# 1. Build the project
npm run build

# 2. Start the server
npm start
```

Open your browser and navigate to:
```text
http://localhost:3001
```

### Mode 2: Development Mode (Hot-Reload)
Run the Vite development server with instant hot module replacement alongside the backend watcher:

```bash
# Terminal 1: Start the React Vite dev server
npm run dev

# Terminal 2: Start the Express backend watcher
npm run dev:server
```
* Frontend runs on `http://localhost:5173` (proxies `/api` requests to backend).
* Backend runs on `http://localhost:3001`.

---

## 7. How to Access on Your Phone via Local Wi-Fi

You can use the full application on your smartphone (iPhone or Android) while connected to the same Wi-Fi network as your PC:

### Step 1: Find Your PC's Local IP Address
In PowerShell, run:
```powershell
Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Select-Object IPAddress
```
*(Example output: `10.75.133.172` or `192.168.1.50`)*

### Step 2: Open on Your Phone Browser
1. Make sure your phone is connected to the same Wi-Fi.
2. Open Safari (iOS) or Chrome (Android).
3. Type in the address bar:
   ```text
   http://<YOUR-PC-IP>:3001
   ```
   *(e.g., `http://10.75.133.172:3001`)*

### Step 3: Add to Phone Home Screen (Standalone App Mode)
* **iPhone (Safari)**: Tap the **Share icon** (square with upward arrow) -> scroll down -> tap **"Add to Home Screen"** -> tap **Add**.
* **Android (Chrome)**: Tap the **three vertical dots (⋮)** -> tap **"Add to Home screen"** / **"Install app"**.

PulsePaper will install as an app icon on your home screen and open in full-screen standalone mode with no browser address bar.

> **Windows Firewall Note**: If your phone cannot connect to `http://<YOUR-PC-IP>:3001`, allow port 3001 in an Administrator PowerShell window:
> ```powershell
> New-NetFirewallRule -DisplayName "PulsePaper Web" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
> ```

---

## 8. How to Run Ingestion Manually

You can trigger a fresh feed ingestion at any time:

### Method 1: CLI Runner
```bash
npm run ingest
```
* Runs migrations.
* Fetches all active arXiv and tech feeds.
* Skips duplicates using `ON CONFLICT (url) DO NOTHING`.
* Prints a summary table showing processed items and errors.

### Method 2: UI Button
Click the **"Fetch Now"** button in the top navigation bar or the mobile bottom bar.

### Method 3: REST API
```bash
curl -X POST http://localhost:3001/api/ingest
```

---

## 9. How the 5 AM Scheduler Works

The automated daily schedule is managed by `node-cron` in `src/scheduler/cron.ts`:
- **Expression**: `0 5 * * *` (5:00 AM every day)
- **Timezone**: `Asia/Dhaka` (`UTC+6`)
- **Execution**: Automatically starts whenever `npm start` is executed.
- When the timer triggers, `runIngestionPipeline()` fetches all enabled sources. Each source runs within an isolated `try/catch` boundary so one offline feed will never halt or affect other sources.

---

## 10. How to Add a New Source

Open `src/sources/defaultSources.ts` and add a new entry to the `DEFAULT_SOURCES` array:

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

Or add a source dynamically at runtime via the REST API:
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

## 11. Configuring Summarization

PulsePaper provides a two-tier summarization system:

1. **AI-Powered Summaries (Google Gemini 2.5 Flash)**:
   - Obtain a free API key at [Google AI Studio](https://aistudio.google.com/).
   - Add your key to `.env`:
     ```env
     GEMINI_API_KEY=AIzaSy...
     ```
   - Generates structured executive summaries with Core Contributions, Key Methodology, and Practical Implications.

2. **Offline Extractive NLP Summarizer (Automatic Fallback)**:
   - If `GEMINI_API_KEY` is not provided or if the network/API is unavailable, PulsePaper automatically uses its built-in offline extractive summarizer (`src/summarization/fallback.ts`).
   - Requires **$0**, no accounts, and works 100% offline.

---

## 12. Automated Verification & Test Suite

Run the built-in test suite to verify all layers of the application:

```bash
# 1. Test database schema migrations and CRUD persistence
npm run test:db

# 2. Test live feed ingestion and deduplication
npm run test:ingest

# 3. Test on-demand summarization (Gemini & offline fallback)
npm run test:summarize

# 4. Verify full application compilation
npm run build
```
