# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Backend (port 3001)
cd backend && npm install   # first time
cd backend && npm start     # node server.js

# Frontend (port 3000)
cd frontend && npm install  # first time
cd frontend && npm start    # vite dev server

# Health check
curl http://localhost:3001/api/health
```

There is no test suite configured. No lint tooling is set up.

## Architecture

**Backend** — Node.js + Express (`backend/server.js`). All routes are mounted there:
- `/api/auth` → `routes/auth.js`
- `/api/incidents` → `routes/incidents.js` (CRUD + stats + filtering)
- `/api/process` → `routes/process.js` (Claude API classification — currently mock)
- `/api/reports` → `routes/reports.js`

All data is persisted to JSON files via `backend/utils/filedb.js`:
- `backend/data/users.json` — hardcoded users (`admin`/`agent01`)
- `backend/data/incidents.json` — all incidents

Authentication uses JWT (`backend/utils/jwt.js`). The middleware chain is `authMiddleware` → optional `adminMiddleware` (both from `backend/middleware/auth.js`). Tokens come from `Authorization: Bearer <token>` headers.

**Frontend** — React 18 + Vite (`frontend/src/`). All API calls go through the centralized Axios client in `frontend/src/api.js`, which automatically injects the JWT from `localStorage` via a request interceptor. Auth state lives in `frontend/src/context/AuthContext.jsx`.

Route protection: `App.jsx` wraps all non-login routes with `<ProtectedRoute>`, which redirects to `/login` when unauthenticated. Layout (Sidebar + Navbar) is applied via `<MainLayout>`.

## Key Patterns

**Incident schema** (fields expected by backend on create):
`trackingNumber`, `title`, `description`, `priority` (`HIGH`/`MEDIUM`/`LOW`/`ZERO`), `category`

**Priority values:** `HIGH`, `MEDIUM`, `LOW`, `ZERO`
**Status values:** `open`, `in_progress`, `resolved`

**AI classification** (`POST /api/process/classify`) currently returns hardcoded mock data. To enable real Claude API calls, add `CLAUDE_API_KEY` to `backend/.env` and implement the call in `backend/routes/process.js`.

## Environment Variables

```env
# backend/.env
PORT=3001
JWT_SECRET=dhl_incident_secret_key_change_in_production
CLAUDE_API_KEY=your_claude_api_key_here
NODE_ENV=development

# frontend/.env
VITE_API_BASE_URL=http://localhost:3001
```

## Demo Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | admin    | admin123  |
| Agent | agent01  | agent123  |
