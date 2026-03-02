# Exception Management System

## Problem Statement

Operational exceptions such as QC failures, stock mismatches, dispatch errors, route delays, and picking/loading errors are currently tracked manually or not tracked at all. There is no prioritized daily view for management to monitor operational health, leading to repeat errors, slow resolution times, and limited visibility into warehouse and logistics performance.

## Solution Overview

A centralized digital system for capturing, tracking, prioritizing, and resolving operational exceptions across warehouse and logistics operations. The system provides real-time exception logging, lifecycle-based status tracking, automated daily Top 10 issue ranking, and push notifications on status changes. It enables warehouse ops, QC teams, logistics staff, and management to proactively identify and resolve critical issues through a unified dashboard.

## Architecture

```
+-------------------+       +-------------------+       +-------------------------+
|   Android Apps    |       |  React Dashboard  |       |   Supabase Backend      |
| (Picker/Driver)   | ----> |   (Web Portal)    | ----> |   (PostgreSQL + REST)   |
+-------------------+       +-------------------+       +-------------------------+
                                                              |
                                                              v
                                                        +-------------------------+
                                                        |    PostgreSQL Database   |
                                                        | - qc_failures            |
                                                        | - stock_mismatch         |
                                                        | - dispatch_support_logs  |
                                                        | - route_issues           |
                                                        | - operation_errors       |
                                                        +-------------------------+
                                                              |
                                                              v
                                                        +-------------------------+
                                                        |  Notification Engine    |
                                                        |  (FCM)                  |
                                                        +-------------------------+
```

## Tech Stack

- **Frontend:** React 19, JavaScript, CSS
- **Backend:** Supabase (auto-generated REST API)
- **Database:** PostgreSQL (hosted on Supabase)
- **Cloud/Infra:** GitHub Pages (frontend), Supabase Cloud (database)
- **Notifications:** Firebase Cloud Messaging (FCM)
- **Mobile:** Android (Picker App, Driver App)

## Database

The application uses a **Supabase PostgreSQL** database with 5 tables:

| Table | Records | Description |
|-------|---------|-------------|
| `qc_failures` | 7+ | QC failure tracking with item details, reasons, and actions |
| `stock_mismatch` | 5+ | Stock inventory discrepancy alerts |
| `dispatch_support_logs` | 5+ | Dispatch and operational issue logs |
| `route_issues` | 5+ | Route delay and incident reports |
| `operation_errors` | 5+ | General operational and system errors |

**View/Manage Database Tables:**
[Supabase Dashboard - Table Editor](https://supabase.com/dashboard/project/twaohpngrwurqxlswfjv/editor)

**Supabase Project URL:** `https://twaohpngrwurqxlswfjv.supabase.co`

## Features

- **QC Failure Tracking** -- Record, monitor, and resolve product quality issues (damaged, expired, quality issues) with status lifecycle (OPEN -> ACTION_TAKEN -> CLOSED) and action types (DUMPED, REPACKING, FUMIGATION)
- **Stock Mismatch Alerts** -- Detect and resolve inventory inconsistencies where physical stock exists but system shows zero, with status flow (OPEN -> VERIFIED -> RESOLVED)
- **Dispatch Support & Operational Issue Alerts** -- Report and track picking, loading, dispatch, and route issues with optional photo uploads and status tracking (OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED)
- **Route Delay Monitoring** -- Drivers report route issues (breakdowns, traffic, accidents) with GPS location capture and help requests (OPEN -> SUPPORT_SENT -> RESOLVED)
- **Top 10 Daily Issues Engine** -- Automated ranking of most critical operational issues using scoring formula: `Score = (Today Count x 2) + Last 7 Days Repeat Count`
- **Notification & Escalation Engine** -- Real-time push notifications via FCM on exception creation, status changes, and escalations
- **Daily Exception Dashboard** -- Centralized view highlighting top issues with trends for proactive resolution
- **Add Sample Entry** -- One-click addition of random sample entries to any category for demo/testing purposes

## Setup Instructions

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

## Demo Video

_Link to demo video_

## Live Demo

[https://dineshjangirkhetika.github.io/Exception_handling_portal](https://dineshjangirkhetika.github.io/Exception_handling_portal)
