# MPloyChek Verification Desk

Code challenge submission: an Angular single-page app backed by a Node.js / Express / MongoDB API.

## Run it

You need Node.js 20+ and a MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. API
cd server
cp .env.example .env        # then set MONGODB_URI
npm install
npm run dev                 # http://localhost:3000  (seeds demo data on first start)

# 2. Web app (new terminal)
cd client
npm install
npm start                   # http://localhost:4200
```

Demo accounts (also available as one-click buttons on the login page):

| Role         | User ID | Password |
|--------------|---------|----------|
| General User | user    | user123  |
| Admin        | admin   | admin123 |

## What it does

- **Login** with User ID, password and role. The API checks the password (bcrypt) and that the role matches the stored role, then returns a JWT.
- **Dashboard** shows the user's details and a records table (search, status filter, sort, pagination). Records have access levels 1-3. A General User has clearance 1 and sees only level 1 records; the rest appear as redaction bars with a count. An Admin has clearance 3 and sees everything.
- **Admin only: Manage users** to add, edit (name, email, department, role, password) and delete users. Protected by a route guard and by the API.
- **Simulated API delay** : every endpoint accepts `?delay=<ms>` (max 10 s). The "API delay" control sets it. Profile and records load in parallel and each section fills in as soon as its data arrives. The Network activity panel shows each call's timing.

## Architecture

```
server/src
  models/        Mongoose schemas (User, VerificationRecord)
  middleware/    auth (JWT + admin check), delay (?delay=)
  routes/        auth, users, records
  seed.ts        demo data

client/src/app
  core/          services, interceptors, guards, models (app-wide singletons)
  shared/        reusable components (role badge)
  layout/        shell (header + navigation)
  features/      auth, dashboard, admin  (lazy-loaded)
```

Angular techniques used: standalone components, lazy-loaded routes, functional guards and interceptors, `provideAppInitializer` (restores the session on app load), signals and `computed`, signal inputs, reactive forms with validation, RxJS (`switchMap` to cancel stale requests, a custom `toLoadState` operator), new control flow (`@if`, `@for`, `@switch`), dark/light theme via CSS variables.

API summary

| Method | Path | Access |
|---|---|---|
| POST | /api/auth/login | public |
| GET | /api/users/me | signed in |
| GET | /api/records | signed in (filtered by clearance) |
| GET / POST / PUT / DELETE | /api/users[/:id] | Admin |

All endpoints accept `?delay=<ms>`.

## Deploying (cloud notes)

The API is a standard Express app, so it runs on any Node host (AWS Elastic Beanstalk, App Runner, Render). MongoDB Atlas can be swapped for DynamoDB by replacing the Mongoose models with the AWS SDK. Update `API_URL` in `client/src/app/core/api.ts` and `CLIENT_ORIGIN` in the server `.env`.
