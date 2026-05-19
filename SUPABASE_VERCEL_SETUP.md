# Supabase + Vercel setup (your project)

Project ref: `blnhbcehrmekhkklkvng`

## Environment variables explained

| Variable | Required? | Used by this app? |
|----------|-----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional today | Reserved for Supabase JS client / future features |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional today | Same — safe to expose in the browser |
| `DATABASE_URL` | **Yes** | **All API routes and pages** (`pg` driver) |
| `NEXT_PUBLIC_APP_NAME` | No | Header title |
| `DEMO_USER_ID` | No | Default demo user |

**Important:** This codebase connects with **`DATABASE_URL`**, not only the publishable key. You still need the Postgres connection string from Supabase.

---

## Step 1 — Get `DATABASE_URL` from Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/blnhbcehrmekhkklkvng).
2. **Project Settings** → **Database**.
3. Under **Connection string**, select **URI**.
4. Choose **Transaction pooler** (recommended for Vercel).
5. Copy the URI and replace `[YOUR-PASSWORD]` with your database password.
6. Paste into `.env.local` as `DATABASE_URL=...`

Example shape (region may differ):

```env
DATABASE_URL=postgresql://postgres.blnhbcehrmekhkklkvng:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## Step 2 — Run SQL in Supabase

**SQL Editor** → run in order:

1. `db/schema.sql`
2. `db/rls.sql`
3. `db/seed.sql`

Or from your PC (after `DATABASE_URL` is set in `.env.local`):

```powershell
npm run db:setup
```

---

## Step 3 — Test locally

```powershell
npm run dev
```

Open http://localhost:3000 — you should see property and invoice counts.

---

## Step 4 — Vercel environment variables

**Vercel** → your project → **Settings** → **Environment Variables**.

Add **all** of these for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://blnhbcehrmekhkklkvng.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
DATABASE_URL=<full Supabase pooler URI with password>
NEXT_PUBLIC_APP_NAME=UAE Property SaaS
DEMO_USER_ID=22222222-2222-2222-2222-222222222201
```

Then **Redeploy**.

---

## Security

- **Publishable key** — OK in `NEXT_PUBLIC_*` (browser).
- **Never** commit or expose `service_role` / secret keys.
- `.env.local` is gitignored — do not commit it.

If you shared keys in chat, rotate them in Supabase → **Settings** → **API** if needed.
