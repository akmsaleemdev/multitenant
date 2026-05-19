# UAE Property SaaS — Multi-Tenant Demo

Production-quality **Next.js App Router** demo for a UAE property management SaaS. Demonstrates **multi-tenant isolation**, **PostgreSQL RLS**, **RBAC-ready schema**, intentional security vulnerability + fix, traceable logging, and a minimal dashboard UI.

## Project overview

- **Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS 4, PostgreSQL (`pg`)
- **Tenants:** `Desert Crown Properties` and `Marina Vista Holdings` with isolated properties, tenants, and invoices
- **Auth:** Mock session via HTTP-only cookie (`demo_user_id`) or `DEMO_USER_ID` env — no full auth flows
- **Security story:** Insecure API routes trust `?organizationId=`; secure routes derive org from session only

## Setup

```bash
cp .env.example .env.local
# Edit DATABASE_URL to your PostgreSQL instance
npm install
npm run db:setup
```

### Database setup

Requires PostgreSQL 14+. Creates tables, enables RLS policies, and seeds demo data.

```bash
npm run db:setup
```

SQL lives in `db/schema.sql`, `db/rls.sql`, `db/seed.sql`.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Switch users on the dashboard or **Security** page
- View **Properties** and **Invoices** scoped to your organization
- Use **Security** panel to compare secure vs insecure API behavior

```bash
npm run build
npm start
```

## Seed data

Two organizations with users, properties, tenants, and invoices. Fixed UUIDs in `lib/constants.ts` match `db/seed.sql` for reproducible tests.

| Organization           | Admin user ID (demo)              |
|------------------------|-----------------------------------|
| Desert Crown Properties | `22222222-...2201`               |
| Marina Vista Holdings   | `22222222-...2211`               |

## Intentional isolation bug

**Vulnerable routes** (do not use in production):

- `GET /api/properties/insecure?organizationId=<uuid>`
- `GET /api/invoices/insecure?organizationId=<uuid>`

**Bug:** The handler resolves the real user session but **ignores** `session.organizationId` and queries using the **client-supplied** `organizationId`.

**Exploit path:**

1. Log in as Desert Crown admin (cookie / default user).
2. Call `GET /api/properties/insecure?organizationId=11111111-1111-1111-1111-111111111102` (Marina Vista).
3. Response contains Marina Vista properties — **cross-tenant data leak**.

See `app/api/properties/insecure/route.ts` and `lib/queries/properties.ts` (`getPropertiesInsecure`).

## How the fix works

**Secure routes** (`/api/properties`, `/api/invoices`):

1. `getSession()` loads the user from cookie/env — **never** from query params.
2. `organizationId` is taken **only** from `session.organizationId`.
3. Queries use `WHERE organization_id = $1` with that value.
4. `withOrgContext()` sets `app.current_organization_id` for **RLS** (defense in depth).

```typescript
const session = await getSession();
const organizationId = session.organizationId; // server-derived only
const properties = await getPropertiesWithRls(organizationId);
```

## How tenant isolation was verified

```bash
# Unit tests (heuristic + constants always run)
npm test

# Integration tests (requires DATABASE_URL + seeded DB)
npm test

# Standalone security verification script
npm run test:security
```

Tests in `tests/tenant-isolation.test.ts`:

1. **Cross-tenant property access blocked** — secure queries return disjoint property sets per org.
2. **Cross-tenant invoice access blocked** — same for invoices.
3. Insecure query pattern documented to prove exploit class.

Manual: use **Security** page buttons or curl:

```bash
curl -b "demo_user_id=22222222-2222-2222-2222-222222222201" http://localhost:3000/api/properties
curl -b "demo_user_id=22222222-2222-2222-2222-222222222201" "http://localhost:3000/api/properties/insecure?organizationId=11111111-1111-1111-1111-111111111102"
```

## RLS / RBAC assumptions

- **RLS** enabled on all tenant tables (`db/rls.sql`).
- Session variable `app.current_organization_id` set per request via `set_config`.
- Policies: `organization_id = current_org_id()` for SELECT (and INSERT/UPDATE on properties).
- **RBAC:** `users.role` is `admin | manager | agent` — not enforced in API yet; schema supports future policy refinement.
- **Production Supabase:** Replace `current_org_id()` with `auth.jwt() ->> 'organization_id'` from **app_metadata** (never `user_metadata`).
- App uses a **direct Postgres pool** (not Supabase client) for clarity; RLS still applies when `withOrgContext` is used.

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/properties` | GET | Secure — session org only |
| `/api/properties/insecure` | GET | **Vulnerable** — trusts `organizationId` param |
| `/api/invoices` | GET | Secure |
| `/api/invoices/insecure` | GET | **Vulnerable** |
| `/api/rent-recommendation` | POST | Heuristic rent stub |
| `/api/auth/switch-user` | POST | Demo user switch |

## Rent recommendation (bonus)

`POST /api/rent-recommendation` with JSON body:

```json
{
  "base_rent_aed": 12000,
  "unit_count": 48,
  "occupied_units": 42,
  "location": "Dubai Marina"
}
```

Explainable rules in `lib/rent-recommendation.ts` — **not** production ML.

## Tradeoffs (45-minute timebox)

- Mock auth instead of Supabase Auth / JWT refresh flows
- Direct `pg` pool instead of `@supabase/ssr` (fewer moving parts for reviewers)
- RLS demonstrated but secure routes also filter in SQL (belt and suspenders)
- No CRUD mutations — read-only APIs sufficient for isolation demo
- No Docker Compose — assumes local or hosted Postgres
- Minimal UI — no design system, charts, or animations

## AI tooling notes

- **Tools used:** Cursor IDE with Claude (agent), Supabase plugin context for RLS guidance
- **AI accelerated:** Boilerplate Next.js structure, SQL schema/seed, API route scaffolding, Vitest test skeletons, README outline
- **Manually rewritten:** Intentional vulnerability comments, org context/session flow, security panel UX, fixed UUID seed strategy, verification script assertions
- **Rejected:** Full Supabase Auth integration, Prisma ORM layer, separate microservices, heavy component libraries
- **Verification:** `npm test`, `npm run test:security`, manual Security page + structured JSON logs
- **Time-saving tradeoffs:** Skipped E2E Playwright, skipped migration versioning tool, single `db:setup` script vs incremental migrations
- **Review focus:** `lib/auth.ts`, insecure vs secure API routes, `tests/tenant-isolation.test.ts`

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_APP_NAME` | App title in header |
| `DEMO_USER_ID` | Default user when no session cookie |

## Project structure

```
app/           # Pages + API routes
components/    # UI components
lib/           # Auth, DB, queries, types
db/            # schema.sql, rls.sql, seed.sql
scripts/       # setup-db, verify-tenant-isolation
tests/         # Vitest security + unit tests
```

## License

Demo / assessment use.
