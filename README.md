# ESG-365

## MEIL ESG & BRSR Reporting Platform

ESG-365 is a centralized ESG and BRSR reporting platform designed to streamline the collection, validation, review, approval, consolidation, and reporting of Environmental, Social, and Governance (ESG) data across the MEIL organizational hierarchy.

The platform enables project-level ESG data collection and consolidates approved data across:

**Project → Business Unit → Subsidiary → MEIL Group**

---

# 🎯 Problem Statement

Managing ESG and BRSR data across multiple subsidiaries, business units, and projects can lead to:

- Fragmented ESG data
- Manual data collection
- Spreadsheet dependency
- Inconsistent reporting formats
- Lack of evidence and audit traceability
- Difficulty in reviewing and approving submissions
- Manual consolidation across organizational levels
- Risk of duplicate counting and reporting errors

ESG-365 addresses these challenges through a centralized and structured ESG data management system.

---

# 💡 Proposed Solution

ESG-365 provides an end-to-end workflow for ESG data management:

```text
Collect
   ↓
Validate
   ↓
Submit
   ↓
Review
   ↓
Approve / Request Correction
   ↓
Consolidate
   ↓
Analyze
   ↓
Report
```

The platform provides role-based access, project-level data submission, review workflows, dashboard monitoring, approved-data consolidation, and BRSR summary reporting.

---

# 🏗️ Organizational Data Flow

ESG data moves through the MEIL organizational hierarchy:

```text
Project
   ↓
Business Unit
   ↓
Subsidiary
   ↓
MEIL Group
```

Approved project-level information can be consolidated into higher organizational levels through the platform.

---

# 🚀 Key Features

## 1. Centralized ESG Data Collection

Project users can submit ESG information through structured forms rather than relying on disconnected spreadsheets or manual communication.

---

## 2. Validation and Submission Workflow

Submitted data follows a controlled workflow:

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER_REVIEW
  ↓
CORRECTION_REQUIRED
  ↓
RESUBMITTED
  ↓
APPROVED
```

This provides a clear status for every ESG submission.

---

## 3. Evidence Management

Users can submit supporting evidence along with ESG data.

Examples include:

- Electricity bills
- Water reports
- Safety documents
- Other supporting ESG documents

Evidence files are uploaded through the backend and stored in the local `uploads/` directory in the current implementation.

---

## 4. Review and Approval

Reviewers can inspect ESG submissions and make decisions.

A submission can be:

- Approved
- Sent back for correction
- Moved into review

The review process maintains a controlled approval workflow.

---

## 5. Dashboard

The platform provides dashboard-level information such as:

- Submission counts
- Pending submissions
- Under-review submissions
- Approved submissions
- Correction-required submissions
- Organization-level reporting progress

---

## 6. Approved Data Consolidation

Approved ESG data can be consolidated across the organizational hierarchy:

```text
Project
   ↓
Business Unit
   ↓
Subsidiary
   ↓
MEIL Group
```

The current backend provides an approved-data consolidation endpoint for administrators.

---

## 7. BRSR Summary

The platform provides a BRSR summary endpoint based on the approved data currently supported by the backend.

The current implementation does **not** implement complete BRSR calculations or AI-based reporting services.

---

# 👥 User Roles

ESG-365 currently supports the following roles:

## Project User

Project users can:

- Log in
- View records belonging to their assigned project
- Create ESG submissions
- Submit ESG data
- Upload supporting evidence
- View their project records

---

## Reviewer

Reviewers can:

- View ESG submissions
- Review submitted information
- Inspect evidence
- Approve submissions
- Request corrections
- Move submissions through the review workflow

---

## Admin

Administrators can:

- View organization-level dashboard information
- Access approved-data consolidation
- Access the BRSR summary
- Monitor overall ESG reporting activity

---

# 🧠 Backend Architecture

The backend is a lightweight Express and MySQL API designed to work with the existing React frontend.

```text
React Frontend
      │
      │ REST API
      ▼
Node.js + Express
      │
      ├── Authentication
      ├── Authorization
      ├── ESG Submissions
      ├── Review Workflow
      ├── Dashboard
      ├── Consolidation
      └── BRSR Summary
      │
      ▼
    MySQL
```

Uploaded evidence files are currently stored locally and served through the backend.

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Node.js |
| API Framework | Express.js |
| Database | MySQL 8 |
| Authentication | JWT |
| API Communication | REST API |
| File Upload | Multipart/Form-Data |
| Evidence Storage | Local `uploads/` directory |
| Frontend API URL | `VITE_API_URL` |
| Development | Node.js 20+ |

---

# 📋 Requirements

Before running the backend, install:

- Node.js 20 or newer
- MySQL 8
- Existing React frontend
- MySQL Workbench or MySQL shell

The existing frontend is expected to run at:

```text
http://localhost:5173
```

---

# ⚙️ Backend Installation

From the `backend` directory:

```powershell
npm install
Copy-Item .env.example .env
```

Configure the `.env` file with valid database credentials.

At minimum, configure:

```text
DB_PASSWORD=<your-mysql-password>
JWT_SECRET=<private-random-secret>
```

Do not commit `.env` to Git.

---

# 🗄️ Database Setup

The project provides:

```text
database/
├── schema.sql
└── seed.sql
```

Run the following scripts in order:

```text
1. schema.sql
2. seed.sql
```

Both scripts use the:

```text
meil_esg
```

database.

The seed data creates:

- Alpha
- Beta
- Gamma
- Delta
- Required role accounts
- Project users for the remaining projects
- Twelve FY 2026 submissions
- Submissions distributed across the supported statuses

---

# 🔐 Seeded Login Accounts

All seeded accounts use:

```text
Password: 123456
```

### Project User

```text
user@meil.com
```

### Reviewer

```text
reviewer@meil.com
```

### Admin

```text
admin@meil.com
```

### Additional Project Users

```text
beta.user@meil.com
gamma.user@meil.com
delta.user@meil.com
```

These credentials are intended for local/demo use.

---

# ▶️ Start the Backend

Make sure MySQL is running and `.env` contains valid credentials.

Then run:

```powershell
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

API routes are available under:

```text
/api
```

Uploaded evidence files are stored in:

```text
uploads/
```

and served through:

```text
/uploads/
```

---

# 🔌 API Endpoints

## Authentication

```http
POST /api/auth/login
```

---

## ESG Submissions

```http
GET /api/esg/submissions

POST /api/esg/submissions

GET /api/esg/submissions/:id

PUT /api/esg/submissions/:id
```

The submission creation endpoint supports:

```text
JSON
```

and:

```text
multipart/form-data
```

---

## Review

```http
PUT /api/esg/submissions/:id/review

PUT /api/esg/submissions/:id/approve
```

The review endpoint supports both of the following request formats:

```json
{
  "reviewComment": "Please verify the submitted value.",
  "status": "CORRECTION_REQUIRED"
}
```

and:

```json
{
  "decision": "CORRECTION_REQUIRED",
  "comment": "Please verify the submitted value."
}
```

If a correction decision is omitted, the record can be moved to:

```text
UNDER_REVIEW
```

---

## Dashboard

```http
GET /api/dashboard
```

---

## Consolidation

Administrator access:

```http
GET /api/consolidation
```

---

## BRSR Summary

Administrator access:

```http
GET /api/reports/brsr
```

---

# 🔑 API Authentication

Authenticated API requests use:

```http
Authorization: Bearer <token>
```

The login response intentionally returns:

```json
{
  "token": "...",
  "user": {}
}
```

at the top level to match the existing frontend `AuthContext`.

Other successful API responses also expose their service fields at the top level because the current frontend service helpers do not unwrap nested `data` envelopes.

Errors follow:

```json
{
  "success": false,
  "message": "..."
}
```

---

# 🌐 Frontend Configuration

The frontend should use:

```text
VITE_API_URL=http://localhost:5000/api
```

The existing API service:

- Reads the JWT from local storage
- Attaches the token to authenticated requests
- Handles multipart requests correctly
- Supports the backend API structure

Mock fallback is controlled separately through:

```text
VITE_USE_MOCK_DATA
```

Mock mode does not intentionally hide HTTP errors.

---

# 🔄 Submission Workflow

The complete workflow is:

```text
Project User
     │
     ▼
Create ESG Submission
     │
     ▼
Validate Data
     │
     ▼
Submit
     │
     ▼
Reviewer
     │
     ├───────────────┐
     │               │
     ▼               ▼
Approve        Correction Required
     │               │
     │               ▼
     │          Resubmit
     │               │
     │               ▼
     │            Review
     │
     ▼
Approved
     │
     ▼
Consolidation
     │
     ▼
Dashboard / BRSR Summary
```

---

# 📊 Current ESG Scope

The current backend implementation specifically supports:

```text
Energy Submissions
```

Approved energy values are normalized for report totals using:

```text
1 MWh = 1000 kWh
```

The current backend does not implement other ESG metrics or derived disclosure calculations.

---

# ⚠️ Current Implementation Scope

The current backend is intentionally limited.

It supports:

- User login
- Role-based access
- Energy submissions
- Submission review
- Approval workflow
- Dashboard counts
- Approved-data consolidation
- BRSR summary
- Evidence file upload
- Local evidence storage

It does **not** currently implement:

- Complete BRSR calculations
- Full ESG metric coverage
- AI services
- Advanced ESG analytics
- Automated BRSR disclosure calculations
- Cloud-based evidence storage

These can be added as future extensions.

---

# 🧩 Recommended Future Enhancements

The platform can be extended with:

### ESG Metrics

```text
Energy
Water
Waste
Emissions
Employee Safety
Training
Employee Information
CSR
Governance
```

### Advanced Reporting

- Full BRSR reporting structure
- Automated disclosure calculations
- Exportable PDF reports
- Excel exports
- Period-wise comparisons
- Organization-level benchmarking

### Evidence & Audit

- Cloud storage
- Evidence versioning
- Complete audit history
- Document verification
- Approval history

### Analytics

- ESG trend analysis
- Year-over-year comparison
- Missing-data detection
- Performance indicators
- Risk indicators

### AI

Potential future AI services could include:

- Document extraction
- ESG data classification
- Anomaly detection
- Missing-data detection
- Report assistance

---

# 🏁 Project Summary

ESG-365 provides a centralized workflow for managing ESG information across the MEIL hierarchy.

The core process is:

```text
Collect
   ↓
Validate
   ↓
Submit
   ↓
Review
   ↓
Approve / Correct
   ↓
Consolidate
   ↓
Analyze
   ↓
Report
```

The current implementation provides the foundation for this workflow using:

```text
React
   ↓
Node.js + Express
   ↓
MySQL
```

with JWT-based authentication and role-based access.

The platform is designed to reduce spreadsheet dependency, improve review visibility, centralize ESG submissions, support approved-data consolidation, and provide a foundation for future BRSR reporting capabilities.

---

## Quick Start

```powershell
# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Configure .env
# DB_PASSWORD=...
# JWT_SECRET=...

# Create database
# Run:
# ../database/schema.sql
# ../database/seed.sql

# Start backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

Frontend:

```text
http://localhost:5173
```

API base URL:

```text
http://localhost:5000/api
```

**ESG-365 — Centralized ESG Data. Controlled Review. Approved Consolidation. BRSR-Ready Reporting.**