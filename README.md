# PolynexAI Admin Dashboard

Desktop-first admin web app for the PolynexAI election command platform.
Companion product to the existing PolynexAI Worker / Leadership survey app.

## Stack

| Layer    | Tech                                   |
|----------|-----------------------------------------|
| Frontend | React 18 + Vite, React Router, Zustand |
| Backend  | Node.js + Express                       |
| Database | MongoDB (Mongoose)                      |
| Auth     | JWT (email + password — Admin only)     |

## Monorepo layout

```
polynexai-admin/
├── backend/          Express API (routes/controllers/models/middleware)
└── frontend/          React + Vite SPA
```

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run dev                # nodemon on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # fill in VITE_API_BASE_URL
npm install
npm run dev                # vite on http://localhost:5173
```

### 3. MongoDB

Local dev: run `mongod` locally and point `MONGO_URI` at
`mongodb://127.0.0.1:27017/polynexai_admin`, or use a free MongoDB Atlas
cluster and drop the connection string into `backend/.env`.

## Reference docs

- `PolynexAI-Admin-Feature-Spec.md` — full feature spec
- `PolynexAI-Admin-Task-List.md` — phased build checklist (this repo tracks Phase 0)

## Status

- [x] Phase 0 — Project Setup (this scaffold)
- [ ] Phase 1 — Authentication & Access
- [ ] Phase 2 — Election / Campaign Context
- [ ] ...see task list
