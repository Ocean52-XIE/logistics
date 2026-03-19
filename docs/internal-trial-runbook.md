# Internal Trial Runbook

## 1. Purpose

Use this runbook to conduct a small-scope MVP trial with employee and admin roles.
The goal is to validate that the end-to-end training loop is stable before wider rollout.

## 2. Preconditions

- Node.js and npm installed.
- PostgreSQL is reachable by backend `DATABASE_URL`.
- Migrations are applied and seed data is loaded.

## 3. Environment Setup

1. Install dependencies.

```bash
npm install
```

2. Apply backend migrations.

```bash
npm run prisma:deploy -w @logistics/backend
```

3. Load trial seed dataset.

```bash
npm run db:seed -w @logistics/backend
```

4. Start both apps.

```bash
npm run dev
```

## 4. Trial Accounts

- Employee: `employee1 / 123456`
- Employee 2: `employee2 / 123456`
- Admin: `admin1 / 123456`
- Manager: `manager1 / 123456`
- Trainer: `trainer1 / 123456`

## 5. Trial Checklist

### Employee path

1. Log in as `employee1`.
2. Open `/dashboard`, verify metrics and tasks load.
3. Open `/courses`, enter one course, open lesson `L-1004`.
4. Click `Mark Complete` and confirm progress save.
5. Open exam `EX-301`, answer and submit.
6. Confirm submission result appears and second submit is blocked.

### Admin path

1. Log in as `admin1`.
2. Go to `/admin/courses`, create a draft course and publish it.
3. Go to `/admin/training-plans`, create a plan with at least 1 course and 1 assignee.
4. Go to `/admin/reports`, verify overview metrics render.

## 6. Exit Criteria

- Employee core flow runs end-to-end without manual DB fixes.
- Admin core flow runs end-to-end and writes data successfully.
- Test gate passes locally:

```bash
npm run typecheck
npm run build
npm test
```

## 7. Troubleshooting

- If API returns `401`, re-login to refresh token.
- If seed fails, verify `DATABASE_URL` and rerun migration + seed.
- If E2E fails with missing browser, run:

```bash
npx playwright install chromium
```
