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

| Method         | Route                           | Description                                              |
| -------------- | ------------------------------- | -------------------------------------------------------- |
| POST           | /api/auth/register              | Create account                                           |
| POST           | /api/auth/login                 | Login, returns JWT                                       |
| POST           | /api/auth/forgot-password       | Email a reset link (404 if the email isn't registered)   |
| POST           | /api/auth/reset-password/:token | Set a new password (link valid 15 min) and sign in       |
| GET            | /api/auth/me                    | Current user                                             |
| GET/POST       | /api/expenses                   | List (search, category, month or from/to, sort) / create |
| GET/PUT/DELETE | /api/expenses/:id               | Read / update / delete                                   |
| GET/POST       | /api/categories                 | List / create categories (8 defaults seeded per user)    |
| GET            | /api/dashboard/summary          | Month total, today total, daily average, top category    |

## Features

- Dashboard: total this month, total today, average daily spending, highest spending category
- Default categories: Food, Transport, Shopping, Bills, Health, Entertainment, Education, Other — plus add your own
- Expense search & filters: title search, category, month or custom date range, sort by newest / oldest / highest / lowest
- Show/hide (eye) toggle on every password field
- Forgot password: shows an error for unregistered emails, otherwise emails a reset link (hashed single-use token, 15-minute expiry). Without SMTP settings in `backend/.env`, the link is printed in the API console for local testing.
- Light / dark theme (follows system on first visit, remembered afterwards)
- Apple-inspired UI (SF font stack, translucent nav, soft cards, pill buttons)
