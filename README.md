# SpendWise — Personal Expense Tracker

A MEAN stack (MongoDB, Express, Angular, Node.js) app to track personal expenses.

## Structure

```
spendwise/
├── backend/    Express + TypeScript + Mongoose API
└── frontend/   Angular (standalone components) + Tailwind CSS
```

## Getting started

```bash
npm run install:all
cp backend/.env.example backend/.env   # set MONGO_URI and JWT_SECRET
npm run dev                            # runs API + Angular together
```

API health check: `GET http://localhost:5000/api/health`

## API (initial)

| Method         | Route                  | Description                                              |
| -------------- | ---------------------- | -------------------------------------------------------- |
| POST           | /api/auth/register     | Create account                                           |
| POST           | /api/auth/login        | Login, returns JWT                                       |
| GET            | /api/auth/me           | Current user                                             |
| GET/POST       | /api/expenses          | List (search, category, month or from/to, sort) / create |
| GET/PUT/DELETE | /api/expenses/:id      | Read / update / delete                                   |
| GET/POST       | /api/categories        | List / create categories (8 defaults seeded per user)    |
| GET            | /api/dashboard/summary | Month total, today total, daily average, top category    |

## Features

- Dashboard: total this month, total today, average daily spending, highest spending category
- Default categories: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Other — plus add your own
- Expense search & filters: title search, category, month or custom date range, sort by newest / oldest / highest / lowest
- Light / dark theme (follows system on first visit, remembered afterwards)
- Apple-inspired UI (SF font stack, translucent nav, soft cards, pill buttons)
