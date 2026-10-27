# SpendWise — Personal Expense Tracker

A MEAN stack (MongoDB, Express, Angular, Node.js) app to track personal expenses.

## Structure
```
spendwise/
├── backend/    Express + TypeScript + Mongoose API (port 5000)
└── frontend/   Angular (standalone components) + Tailwind CSS (port 4200)
```

## Getting started
```bash
npm run install:all
cp backend/.env.example backend/.env   # set MONGO_URI and JWT_SECRET
npm run dev                            # runs API + Angular together
```
API health check: `GET http://localhost:5000/api/health`

## API (initial)
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |
| GET | /api/auth/me | Current user |
| GET/POST | /api/expenses | List / create expenses |
| GET/PUT/DELETE | /api/expenses/:id | Read / update / delete |
| GET/POST | /api/categories | List / create categories |

## Planned features
Dashboard & charts, filters/search, budgets, recurring expenses, CSV export.
