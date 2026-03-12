# Leavemetry – HR Leave Management

Web application for leave management: authentication, HR manager dashboard, employee dashboard, leave requests, analytics, calendar, and holidays.

## Tech stack

- **Backend:** Node.js, Express, MongoDB, JWT
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/leavemetry`)

## Setup

### Backend

```bash
cd server
npm install
npm run seed    # creates admin: admin@gmail.com / admin123
npm run dev     # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

## Usage

1. Open http://localhost:5173 and log in with **admin@gmail.com** / **admin123** (HR) or create an employee account via the API.
2. **HR:** Dashboard (analytics + last leaves), Analytics (chart), Employees, Leaves (approve/reject), Calendar, Holidays, Settings.
3. **Employee:** Dashboard (leave balance + ask for leave), My Space (leave history), Calendar, Announcements, User Settings.
4. **Password reset:** Login → "Forgot Password?" → enter email → receive code (see server console in dev) → enter code → new password → login.

## API base URL

Frontend uses `http://localhost:5000/api`. Override with `VITE_API_URL` if needed (and use it in `src/lib/api.ts`).
