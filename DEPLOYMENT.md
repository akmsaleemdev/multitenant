# Deployment — GitHub + Vercel

## GitHub

Repository: [https://github.com/akmsaleemdev/multitenant](https://github.com/akmsaleemdev/multitenant)

```bash
git remote add origin https://github.com/akmsaleemdev/multitenant.git
git push -u origin main
```

## Vercel (production)

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected).
3. Add environment variables:

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes (for live data) | Neon/Supabase Postgres connection string |
| `NEXT_PUBLIC_APP_NAME` | No | `UAE Property SaaS` |
| `DEMO_USER_ID` | No | `22222222-2222-2222-2222-222222222201` |

4. After first deploy, run schema + seed against production DB (from your machine):

```bash
DATABASE_URL="your-production-url" npm run db:setup
```

5. Redeploy or refresh the app.

### CLI deploy

```bash
npx vercel login
npx vercel link
npx vercel env add DATABASE_URL
npx vercel --prod
```

## Notes

- Without `DATABASE_URL`, the UI loads but APIs return `503` and lists are empty.
- Use [Vercel Marketplace → Neon Postgres](https://vercel.com/marketplace) for a managed `DATABASE_URL`.
