# Exception Management System

## Problem Statement

Operational exceptions such as QC failures, stock mismatches, dispatch errors, route delays, and picking/loading errors are currently tracked manually or not tracked at all across warehouse and logistics operations. There is no centralized, prioritized daily view for management to monitor operational health. This leads to repeat errors going undetected, slow resolution times, lack of accountability, and limited visibility into warehouse and logistics performance -- ultimately causing revenue loss and customer dissatisfaction.

## Solution Overview

Our solution addresses the lack of real-time operational exception visibility in warehouse and logistics operations. We built a **centralized Exception Management System (EMS)** -- a web-based platform that enables warehouse ops, QC teams, logistics staff, and management to **capture, track, prioritize, and resolve operational exceptions** through a unified dashboard.

The system provides real-time exception logging across 5 critical categories (QC failures, stock mismatches, dispatch issues, route delays, and operation errors), lifecycle-based status tracking with role-specific notifications, an automated **Daily Top 10 issue ranking engine** using a weighted scoring formula, and instant data insertion for rapid issue capture. It replaces manual spreadsheets and WhatsApp-based tracking with a structured, database-driven workflow that ensures nothing falls through the cracks.

## Architecture

```
+---------------------+       +-------------------------+       +----------------------------+
|    Android Apps      |       |    React 19 Dashboard   |       |    Supabase Backend        |
|  (Picker / Driver)   | ----> |     (Web Portal)        | ----> |  (PostgreSQL + REST API)   |
+---------------------+       +-------------------------+       +----------------------------+
        |                              |                                    |
        |  Report exceptions           |  View / Manage / Track            |  Auto-generated REST API
        |  from the field              |  exceptions in real-time          |  Row Level Security (RLS)
        |                              |                                    |  DB Triggers (auto date)
        v                              v                                    v
+---------------------+       +-------------------------+       +----------------------------+
|  Exception Capture   |       |   Dashboard Features    |       |   PostgreSQL Database      |
| - QC scan + report   |       | - Category drill-down   |       | - qc_failures              |
| - Stock flag         |       | - Status lifecycle      |       | - stock_mismatch           |
| - Route issue + GPS  |       | - Daily Top 10 engine   |       | - dispatch_support_logs    |
| - Dispatch log       |       | - Date filtering        |       | - route_issues             |
+---------------------+       | - One-click sample add  |       | - operation_errors         |
                               | - Real-time refresh     |       +----------------------------+
                               +-------------------------+                  |
                                                                            v
                                                               +----------------------------+
                                                               |   Notification Engine      |
                                                               |   (Firebase Cloud Messaging)|
                                                               +----------------------------+
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, JavaScript (ES6+), CSS3 |
| **Backend** | Supabase (auto-generated REST API over PostgreSQL) |
| **Database** | PostgreSQL (hosted on Supabase Cloud, Mumbai region) |
| **Cloud/Infra** | GitHub Pages (frontend hosting), Supabase Cloud (database + API) |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Mobile** | Android (Picker App, Driver App) |
| **CI/CD** | GitHub Pages deployment via `gh-pages` |

## Database

The application uses a **Supabase PostgreSQL** database with 5 tables, auto-generated REST API, Row Level Security (RLS), and database triggers for auto-populating date fields.

| Table | Records | Description |
|-------|---------|-------------|
| `qc_failures` | 7+ | QC failure tracking with item details, batch info, reasons, and corrective actions |
| `stock_mismatch` | 5+ | Stock inventory discrepancy alerts with verification workflow |
| `dispatch_support_logs` | 5+ | Dispatch, picking, and loading issue logs with photo support |
| `route_issues` | 5+ | Route delay and incident reports with GPS coordinates |
| `operation_errors` | 6+ | General operational and system error tracking |

**Database Features:**
- Row Level Security (RLS) with public read/insert/update policies
- Database triggers (`set_date_column()`) for automatic date population on insert
- Date format: D-M-YYYY (e.g., 2-3-2026) for Indian locale
- 10-minute client-side caching with localStorage for fast subsequent loads
- Embedded seed data fallback for offline/demo scenarios

**View/Manage Database Tables:**
[Supabase Dashboard - Table Editor](https://supabase.com/dashboard/project/twaohpngrwurqxlswfjv/editor)

**Supabase Project URL:** `https://twaohpngrwurqxlswfjv.supabase.co`

## Features

1. **QC Failure Tracking** -- Record, monitor, and resolve product quality issues (damaged, expired, quality issues) with full status lifecycle (OPEN -> ACTION_TAKEN -> CLOSED) and action types (DUMPED, REPACKING, FUMIGATION). Includes item ID, batch ID, QR code, expiry date, and variety tracking.

2. **Stock Mismatch Alerts** -- Detect and resolve inventory inconsistencies where physical stock differs from system records, with scenario classification (SYSTEM_QTY_MORE_THAN_PHYSICAL, SYSTEM_QTY_LESS_THAN_PHYSICAL, PHYSICAL_QTY_ZERO) and status flow (OPEN -> VERIFIED -> RESOLVED).

3. **Dispatch Support & Operational Issue Alerts** -- Report and track picking, loading, and dispatch problems from the warehouse floor with issue categorization (DAMAGED_IN_TRANSIT, MISSING_ITEM, DELAYED_PICKUP), optional photo uploads, and multi-stage status tracking (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).

4. **Route Delay Monitoring** -- Drivers report en-route incidents (breakdowns, traffic jams, wrong addresses) with GPS location capture (latitude/longitude), help request flags, and transport team coordination (OPEN -> SUPPORT_SENT -> RESOLVED).

5. **Operation Error Tracking** -- Centralize high-level operational and system errors (scanner malfunction, cold storage alerts, conveyor jams) for management visibility with multi-stage resolution flow (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED).

6. **Daily Top 10 Issues Engine** -- Automated ranking of the most critical operational exceptions across all 5 categories using a weighted scoring formula: `Score = (Today Count x 2) + Last 7 Days Repeat Count`. Includes Focus Top 3 mode for management quick-view.

7. **Notification & Escalation Engine** -- Real-time push notifications via Firebase Cloud Messaging (FCM) on exception creation, status changes, and escalations. Role-based notification routing (picker, allocator, driver, ops team).

8. **One-Click Sample Entry** -- Instant addition of realistic random sample entries to any category for demo/testing purposes with auto-generated contextual data.

9. **Date-Based Filtering** -- Filter records by date in D-M-YYYY format with Today shortcut and Show All toggle.

10. **Offline-Ready Seed Data** -- Embedded fallback data ensures the dashboard always displays records even when the database API is unreachable, with automatic sync when connectivity is restored.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/dineshjangirkhetika/Exception_handling_portal.git
   ```

2. Navigate to the dashboard directory:
   ```bash
   cd Exception_handling_portal/dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

The application uses Supabase as the backend. The following configuration is set in `src/supabaseClient.js`:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project API endpoint |
| `SUPABASE_ANON_KEY` | Public anonymous key for client-side access (safe to expose) |

> **Note:** The Supabase anonymous key is a public key designed for client-side use with Row Level Security (RLS) policies. It is not a secret.

### Deployment

```bash
npm run build     # Build for production
npm run deploy    # Deploy to GitHub Pages
```

## Project Structure

```
Exception_handling_portal/
  dashboard/
    public/
      index.html            # HTML entry point
      manifest.json         # PWA manifest
    src/
      App.js                # Root component with navigation
      supabaseClient.js     # Supabase client, caching, CRUD operations
      seedData.js           # Embedded fallback data for offline/demo
      styles.css            # Global styles
      components/
        DashboardHome.js    # Main dashboard with category cards
        CategoryScreen.js   # Category detail view with data table
        TopIssuesScreen.js  # Daily Top 10 scoring engine
        StatusBadge.js      # Status indicator component
        Toast.js            # Notification toast component
    package.json
    README.md
```

## Demo Video

_Link to demo video_

## Live Demo

[https://dineshjangirkhetika.github.io/Exception_handling_portal](https://dineshjangirkhetika.github.io/Exception_handling_portal)

## Submission Description

Our solution addresses the lack of real-time operational exception visibility in warehouse and logistics operations.

We built a **centralized Exception Management System** -- a web-based platform that enables warehouse ops, QC teams, logistics staff, and management to capture, track, prioritize, and resolve operational exceptions through a unified dashboard.

**Key Features:**
1. Real-time exception tracking across 5 critical categories (QC, Stock, Dispatch, Route, Operations)
2. Automated Daily Top 10 issue ranking with weighted scoring formula
3. Lifecycle-based status tracking with role-specific FCM notifications
4. Date-based filtering with instant data display and offline fallback

**Technical Highlights:**
- Architecture: React 19 SPA + Supabase PostgreSQL with auto-generated REST API
- Scalable design using Supabase Cloud (PostgreSQL + Row Level Security + DB Triggers)
- Client-side caching layer with localStorage (10-min TTL) for fast loads
- Embedded seed data for zero-downtime demo capability
- Cloud-native deployment on GitHub Pages + Supabase Cloud (Mumbai region)

**Impact:**
- Replaces manual spreadsheet/WhatsApp-based exception tracking with structured digital workflow
- Reduces exception resolution time through prioritized daily ranking and real-time notifications
- Provides management visibility into repeat issues and warehouse performance trends
- Enables proactive intervention before exceptions escalate into customer-facing problems
