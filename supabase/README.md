# Shared Digital Nomad database

The repository contains a Supabase migration and app integration. A hosted project
must be provisioned and this migration applied before database mode can run.
No hosted project ID, credentials, or production data are committed.

## Provision and connect

1. Create/select a Supabase project in the intended organization. Choose the
   region appropriate for your users (Sydney is a reasonable choice for Fiji).
2. In that project's SQL Editor, run the complete file
   `migrations/202611090001_shared_business.sql` **once** in a new database.
   Alternatively, link the repository using the Supabase CLI and run `supabase db push`.
   The migration creates new tables; it does not drop or import existing data.
   Back up any existing project and inspect name collisions before applying.
3. Under Authentication, create the first administrator account with a password through the Dashboard. The app
   supports email/password sign-in; it does not offer public account signup.
   Keep open public signup disabled unless you deliberately need it.
4. Set these build-time variables in Vercel for each desired environment:

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | The project's HTTPS URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Its public publishable key (or legacy anon key) |

   These two browser values are public configuration. **Never** configure a
   service-role key, `sb_secret_` key, database password, or management token in
   any `VITE_` variable. The app rejects known secret-key formats.
5. Redeploy the **root Vite application** on Vercel, sign in with the account,
   then create the empty company workspace. It starts with no demonstration
   employees, salaries, invoices, or bank records. Create actual records through
   the app. The old shared demo password cannot open database mode.
6. Create any additional Auth accounts securely, then add membership using the
   SQL Editor as the database administrator, with verified UUIDs:

   ```sql
   insert into public.workspace_members (workspace_id, user_id, role)
   values ('<workspace UUID>'::uuid, '<verified auth.users UUID>'::uuid, 'editor');
   ```

   Roles: `admin`/`editor` can change business records; `viewer` can read them.
   All roles can read the workspace's HR/payroll/financial records. This is a
   staff-administration portal, not an employee self-service permission model.
   Only admins can read audit events. Browser clients cannot add memberships or
   grant themselves a role. Member management currently uses administrator SQL.
   The app currently opens the first accessible workspace, ordered by UUID.
7. If running this app in a restricted cloud environment, allow HTTPS to the
   exact Supabase project hostname. No service key is needed by the browser.

## Data model

Each business table has a tenant `workspace_id`, a stable `id`, validated JSONB
`data` matching the TypeScript record, and `updated_at`. Composite keys and
foreign keys keep employee references inside the same workspace. JSONB retains
existing app fields during migration; generated relational columns support
constraints and indexes without maintaining duplicate fields in client code.

| Tables | Purpose |
| --- | --- |
| `workspaces`, `workspace_members` | Company boundary, roles, revision |
| `employees` | Single HR and Bookkeeping employee/pay-settings source |
| `candidates`, `jobs`, `onboarding` | Recruiting and new-hire checklists |
| `leaves`, `attendance` | Requests, decisions, time records |
| `payroll_runs` | Immutable draft runs and per-employee calculation snapshots |
| `invoices`, `expenses` | Recorded revenue and costs |
| `projects`, `tasks`, `timeline` | Project delivery and architecture checklist |
| `departments`, `goals`, `reviews`, `courses`, `assignments` | Workforce reference records |
| `settings`, `company` | Cost planner and company settings |
| `audit_events` | Actor, timestamp, previous/next record data |

Business reads use `read_workspace` and Postgres row-level security. All writes
use `apply_workspace_changes`: it checks membership, locks the workspace row,
checks the expected revision, validates the collection, writes the batch, and
records audit events in the **same transaction**. Table writes are revoked from
browser roles. A stale browser gets a conflict and refreshed state rather than
silently overwriting another user's changes. Save errors remain visible and
forms only close after successful writes. Use **Refresh data** for changes made
by another user; live subscriptions are not configured.

## Connected workflows

- Add/edit an employee from HR or the payroll register: both use the same ID and
  pay terms, in FJD. No fake tax ID or bank account is generated.
- Hire a candidate: candidate status, employee, department (if new), and four
  onboarding tasks are saved atomically. The candidate can only be hired once.
- Complete/reopen onboarding tasks: saved with the same employee reference.
- Request leave, approve/reject, record attendance: persisted and used by both
  dashboard and payroll.
- Create a draft payroll for a complete calendar month: monthly salaries use
  weekday proration, start date, approved unpaid leave and recorded absences;
  overlapping absence/unpaid leave deducts a date only once. Approved paid leave
  overrides an absence. Pending/rejected leave is ignored. Hourly pay uses
  recorded worked hours, excluding approved unpaid-leave dates. Hourly paid-leave
  credits, overtime, public-holiday calendars and statutory tax tables are not
  implemented. Missing attendance does not automatically deduct monthly salary.
- Set applicable contribution and effective withholding rates in employee pay
  settings. New/hired records start with **zero rates**, requiring review.
  These are draft estimates, not certified statutory calculations.
- Payroll rows are immutable drafts, unique per workspace/period. Payment,
  approval, corrections/reversals, banking and filing require a separate workflow.
  Do not create a second overlapping period to bypass a correction.
- Sync cloud costs: stable vendor/month IDs update estimates instead of creating
  duplicates. Invoices, manual expenses and draft payroll commitments feed the
  recorded financial summary. Marking an invoice paid remains manual.
- Reload the page: records are loaded from Postgres. Only Auth session tokens are
  managed in browser storage; business data is not stored in localStorage.

Without both Supabase variables, the app explicitly shows **Demo mode** and does
not save across reloads. A partial/invalid configuration fails closed.

## Verification

Run `npm test`, `npm run lint`, and `npm run build` from the repository root.
The test suite applies the full migration to PGlite (real Postgres in WASM),
checks tenant isolation, anonymous access, viewer restrictions, foreign keys,
transaction rollback, audit visibility, duplicate periods/attendance and
optimistic concurrency. Workflow tests cover shared employees, atomic hiring,
leave decisions, payroll deductions and hourly attendance.

Local Postgres-backed browser checks additionally exercised login, empty
workspace creation, shared employees, hiring/onboarding, leave/attendance,
payroll snapshots, repeat cloud sync, and persistence across page reload.
This does not establish hosted Supabase connectivity, Vercel environment
configuration, production deployment, backups or restore readiness.
