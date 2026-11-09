# Digital Nomad · Cloud & AI Project Cost & Timeline Planner (FJD / USD)

An executive financial planning and architecture sprint tracker built for **Digital Nomad**, modeling 12-month cloud infrastructure and AI operational spend across **Claude AI**, **Supabase Pro**, and **Microsoft Azure** in both **Fiji Dollars (FJD)** and **US Dollars (USD)**, with real Fiji commercial bank card conversion fee accounting.

---

## 🌟 Key Features

### 1. Dual-Currency Financial Engine (FJD / USD)
- **Live Editable Exchange Rate:** Defaults to `1 USD = 2.2554 FJD`, adjustable on-the-fly.
- **Fiji Bank FX Card Spread (+3.5%):** Accounts for real commercial bank conversion fees (ANZ, BSP, Westpac Fiji) charged when settling foreign cloud invoices with local debit/credit cards (`multiplier = 1.035`).
- **Currency Switcher:** Instant toggling between `FJD ($)`, `USD ($)`, and `Dual View` (primary FJD with secondary USD).

### 2. Vendor Pricing Architecture (12-Month Horizon)
- **Claude AI Subscription Schedule:**
  - Month 1: `$20.00 USD` (Claude Pro Plan for initial architecture & prototyping).
  - Months 2–12: Configurable between `$20/mo Pro`, `$100/mo Max (5x)` *(Default)*, or `$200/mo Max (20x)`.
  - **Platform Credit Arbitrage:** Under the `$100/mo Claude Max 5x` plan, subscribers receive **$100/mo in free Claude Platform API credits**, delivering **$1,100.00 USD ($2,526.05 FJD)** in bundled API usage across the year.
- **Supabase Pro Database:**
  - Base Pro Plan: `$25.00 USD / month` (includes `$10/mo` compute credit, 8 GB DB, 100k MAUs, 100 GB storage).
  - Compute Tiers: Micro (`+$0`), Small (`+$5` — *Default*), Medium (`+$50`), Large (`+$100`).
  - Optional Add-ons: Point-in-Time Recovery (PITR 7-day backup: `+$100/mo`), Storage Overages slider (`$0.125 / GB`).
- **Microsoft Azure Backend (Linux App Service & Functions):**
  - Tiers: Serverless Functions (`$2.00/mo`), Lean Linux Basic B1 (`$15.14/mo`), Standard Linux Standard S1 (`$75.00/mo` — *Default*), High-Scale Premium P1v3 (`$140.00/mo`).

### 3. One-Click Architecture Presets
1. **Lean Production ($40.14 USD/mo Hosting + Claude):** Supabase Micro + Azure Basic B1 ($1,601.68 USD / $3,738.86 FJD annual w/ FX).
2. **Standard Commercial ($105.00 USD/mo Hosting + Claude — Default):** Supabase Small + Azure Standard S1 ($2,380.00 USD / $5,555.73 FJD annual w/ FX).
3. **High-Scale / Compliance ($315.00 USD/mo Hosting + Claude):** Supabase Medium + PITR + Azure Premium P1v3 ($4,900.00 USD / $11,438.26 FJD annual w/ FX).
4. **Month 1 Free Dev Tier Optimization:** Simulates developing locally with Supabase CLI Docker containers and Azure Free F1 during Weeks 1–5, reducing Month 1 spend to just `$20.00 USD` (`$46.69 FJD` w/ FX) for Claude Pro.

### 4. Interactive Ledger, Visualizer & Exports
- **12-Month Stacked Bar Trajectory Chart:** Color-coded layers for Claude AI (Purple), Supabase Pro (Brown), Azure Backend (Blue), and 3.5% Bank FX Fee (Orange), with an optional cumulative spend line overlay and rich dual-currency hover tooltips.
- **Itemized Ledger Table:** Month-by-month accounting (`M1` to `M12` + Annual Total) with **Copy Summary** and **Export CSV** (`Digital_Nomad_Cloud_Cost_Planner_FJD_USD.csv`).

### 5. 6-Week Build Timeline & Architecture Blueprint (200 Hours)
- **Interactive Sprint Tracker:** Checkable deliverables and live progress calculations across:
  - **Week 1 (36 hrs):** Architecture Blueprint, Postgres Schema, Row Level Security (RLS) & CI/CD.
  - **Week 2 (24 hrs):** Supabase Auth, JWT Custom Claims, Storage Buckets & Type-Safe SDKs.
  - **Weeks 2–4 (50 hrs):** Azure Microservices (.NET / Node.js), Webhooks & PDF Reporting Engine.
  - **Weeks 3–5 (50 hrs):** Responsive Frontend UI, Realtime WebSockets & Optimistic State.
  - **Week 6 (40 hrs):** RLS Security Audit, Supavisor Connection Pooling (Port 6543), Australia East Latency Benchmarks, UAT & Go-Live.
- **Regional Latency Blueprint:** Fiji to Sydney (`Australia East` / `ap-southeast-2`) subsea cable route benchmarking (~48ms roundtrip) vs US West (~142ms).

### 6. Access
- Supabase mode: individual email/password accounts and database-enforced workspace membership.
- Demo mode: shared access gate with session persistence and quick fill.
- **Demo Access Password:** `DigitalNomad26`

---

## 🛠️ Tech Stack

- **Framework:** React 19, TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Icons:** Lucide React
- **Production Server:** Node.js, Express

---

## 🚀 Getting Started

### Integrated HR Management

Sign in to Digital Nomad and select **HR Management** in the People section.
The dashboard, employees, recruitment, onboarding, attendance, leave, payroll,
performance, training, and HR settings run within the portal on port 3000.
The integrated workspace uses the portal's compiled Tailwind CSS and React runtime;
it does not require the standalone HRMS server or its Tailwind CDN.

HR and Bookkeeping now share one employee roster and payroll history. Hiring,
onboarding, attendance, leave, invoices, expenses, project records and settings
use the shared data layer. In Supabase mode, records survive refresh and require
individual email/password sign-in. Without Supabase configuration, the app
explicitly runs a demo that resets on refresh.

See [Supabase database setup and workflow details](supabase/README.md) for the
migration, Vercel variables, account provisioning, permissions and payroll limits.

The standalone `hrms/` app and its deployment workflow remain available.

### Prerequisites
- Node.js 24.x
- Bun 1.4.4 (lockfile installation), npm (development commands)

### Installation
```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd digital-nomad-cost-planner

# Install dependencies using the committed lockfile
bun install --frozen-lockfile

# Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Launch

### Vercel: deploy the combined portal

Import the root **app** as a single Vercel project. Set Root Directory to `./`,
Application Preset to **Vite**, Node.js to **24.x**, Build Command to
`npm run build`, and Output Directory to `dist`. The root `vercel.json` sets
the frozen Bun installation command. Do not import `hrms/` as a second service
for the combined portal: its components are included in the root application.
Deploy a Git branch containing the integration and `vercel.json` changes.
After deployment, sign in and open **People → HR Management**.

### Local production server
```bash
# Build production bundle
npm run build

# Start production Express server
npm start
```

---

## 📄 License
Proprietary & Confidential · **Digital Nomad** © 2026. All rights reserved.
