# MEIL ESG / BRSR Backend

A small Express and MySQL API for the existing React frontend. It supports user login, energy submissions, reviewer decisions, dashboard counts, approved-data consolidation, and a BRSR summary. It does not implement BRSR calculations or AI services.

## Requirements

- Node.js 20 or newer
- MySQL 8
- The existing frontend running at `http://localhost:5173`

## Install and configure

From this `backend` directory:

```powershell
npm install
Copy-Item .env.example .env
```

Set `DB_PASSWORD` in `.env` to the password for your local MySQL account. Do not commit `.env`; it is ignored by Git. Set `JWT_SECRET` to a private random value before sharing the backend.

## Create and seed the database

Open MySQL Workbench or a MySQL shell as a user allowed to create databases, then run:

1. `../database/schema.sql`
2. `../database/seed.sql`

Both scripts select the `meil_esg` database. The seed is safe to run again. It creates Alpha, Beta, Gamma, and Delta; three required role accounts plus one project account per remaining project; and twelve FY 2026 submissions across all four statuses.

All seeded accounts use password `123456`:

- Project User: `user@meil.com`
- Reviewer: `reviewer@meil.com`
- Admin: `admin@meil.com`
- Additional project users: `beta.user@meil.com`, `gamma.user@meil.com`, `delta.user@meil.com`

## Start the API

Make sure MySQL is running and `.env` has valid connection credentials, then:

```powershell
npm run dev
```

The API listens on `http://localhost:5000`; JSON routes are under `/api`. Uploaded evidence files are stored locally in `uploads/` and served from `/uploads/`.

## API endpoints

- `POST /api/auth/login`
- `GET /api/esg/submissions`
- `POST /api/esg/submissions` (JSON or multipart/form-data)
- `GET /api/esg/submissions/:id`
- `PUT /api/esg/submissions/:id`
- `PUT /api/esg/submissions/:id/review`
- `PUT /api/esg/submissions/:id/approve`
- `GET /api/dashboard`
- `GET /api/consolidation` (admin)
- `GET /api/reports/brsr` (admin)

Authenticated calls use `Authorization: Bearer <token>`. Login intentionally returns `token` and `user` at the top level to match the existing AuthContext. Other successful responses include `success: true` and the service fields at the top level because the current frontend service helpers do not unwrap nested `data` envelopes. Errors use `{ "success": false, "message": "..." }`.

The frontend should use `VITE_API_URL=http://localhost:5000/api`. Its API service already attaches the JWT from localStorage and uses multipart boundaries correctly. Mock fallback remains controlled separately by `VITE_USE_MOCK_DATA` and never hides HTTP errors.

## Workflow notes

Project users can only submit and view records for their assigned project. Reviewers can list and decide submissions. The existing review endpoint accepts both the frontend's `{ "reviewComment": "...", "status": "CORRECTION_REQUIRED" }` body and `{ "decision": "CORRECTION_REQUIRED", "comment": "..." }`; an omitted correction decision moves a record to `UNDER_REVIEW`. Admins can view organization dashboard, consolidation, and the BRSR summary.

Approved energy is normalized to kWh for the report totals (`1 MWh = 1000 kWh`). No other ESG metrics or derived disclosure calculations are performed.
