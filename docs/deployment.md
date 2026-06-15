# Deployment

This document describes the current deployment model for Mushroom Mood.

It is durable operational documentation. Keep it current as deployment choices change. Do not archive it when a planning slice is completed.

Temporary planning notes, implementation logs, review findings, one-off setup details, and slice-specific open questions belong in `docs/plans/`. This file should stay useful after the active deployment slice has been archived.

## Purpose

This file answers:

> How does deployment work now, and how do we operate it safely?

It should contain current, relevant facts about:

- deployment provider,
- environment and branch mapping,
- access/protection expectations,
- environment variable and secret handling,
- baseline validation expectations,
- external API failure expectations,
- rollback,
- disabling beta access,
- documentation/UML update triggers.

It should not contain:

- transient planning discussion,
- implementation-session notes,
- review findings,
- stale links to active slice files,
- secret values,
- long click-by-click provider setup instructions.

If a deployment decision changes, update this file and record the reason in the relevant decision log or project history.

## Provider

Current provider: **Vercel**.

Current project model: **one Vercel project** connected to GitHub.

Vercel Hobby/free uses the built-in environments only:

| Vercel environment | Branch/source | Project meaning | Audience |
| --- | --- | --- | --- |
| Production | `main` | Future beta baseline | Owner only before app auth; beta testers later |
| Preview | `dev` | Owner-only dev-live testing | Owner only |
| Preview | PRs and feature branches | Temporary branch validation | Owner only |
| Development | local/Vercel CLI | Local development | Owner only |

There is no separate custom preprod/dev Vercel environment in the current free-tier setup. The `dev` branch Preview deployment is the dev-live environment.

Reasons for Vercel:

- Good fit for a Next.js app.
- Low-friction GitHub integration.
- Preview deployments for branches and PRs.
- Environment variables for deployed secrets.
- Deployment protection for owner-only testing.
- Rollback/redeploy support.
- Cheap/free starting point for a solo low-traffic beta.

If Vercel becomes a blocker or the provider changes, update this document and record the decision in the relevant plan or decision log.

## Important rule

Deployment foundation does **not** approve beta launch.

The `main`/Production deployment is the future beta baseline, but it must not be publicly usable by arbitrary visitors before app-level invite-only access exists.

Before app-level auth exists, protect or withhold access using one or more provider-level controls, such as:

- Vercel Authentication where available,
- no shared public/custom domain,
- disabled or removed aliases/domains where applicable,
- another provider-level access block.

Do not rely on obscure URLs as protection.

Planned app-level beta access control for the next implementation slice:

- Auth.js email magic-link sign-in through Resend.
- Invite-only beta access controlled by `BETA_ALLOWED_EMAILS`.
- Separate admin/restricted access controlled by `BETA_ADMIN_EMAILS`.
- Whole-app gate except auth routes, logout/callback routes, denied/forbidden pages, static assets, and required framework/auth internals.
- Provider-level deployment protection remains the emergency fallback and owner-only protection mechanism until app-level auth has been validated.

## Branch and promotion strategy

- `main`
  - Protected stable branch.
  - Source for Vercel Production.
  - Future beta baseline.
  - Must not become tester-facing before app-level invite-only auth exists.
- `dev`
  - Working integration branch.
  - Source for the owner-only Preview/dev-live deployment.
  - Used to test changes in a real deployed environment before promotion.
- `feature/<slice-name>`
  - Optional for larger or risky work.
  - Merged into `dev` before promotion.

Promotion flow:

```text
feature/<slice-name> → dev → main
```

Promotion expectations:

- Promote from `dev` to `main` through a PR or explicit owner-approved review checkpoint.
- Run and record `npm test` and `npm run build` before promotion.
- If GitHub Actions checks exist or are added, require them before merging to `main`.
- Tag accepted beta baselines so the exact code revision can be identified later.

Example baseline tag:

```bash
git tag beta-baseline-YYYY-MM-DD
git push origin beta-baseline-YYYY-MM-DD
```

Small solo-dev changes may be made directly on `dev` when risk is low.

## Environment variables and secrets

Use three layers:

```text
.env.example
→ committed to the repo
→ contains variable names only
→ no real values

.env.local
→ local development only
→ contains real local values
→ ignored by Git

Vercel Environment Variables
→ deployed real values
→ configured in Vercel
→ never committed to the repo
```

The app reads values from `process.env`.

Vercel variable scopes must match the environment where the app runs:

- Preview scope for `dev`, PR, and feature-branch deployments.
- Production scope for `main`.
- Development scope only when using Vercel local development.

Do not assume a variable configured in one Vercel scope is available in another.

Do not make committed `.env` files point to a secret vault for the first beta. That is a valid pattern in some enterprise stacks, but it adds provider complexity that is not needed yet.

### Public variables

Variables prefixed with `NEXT_PUBLIC_` are browser-visible and must never contain secrets.

No `NEXT_PUBLIC_` variables are currently required by the app. If one is added later, confirm it is safe for browser exposure before committing.

### External secret providers

Do not introduce Azure Key Vault, Doppler, 1Password Secrets Automation, AWS Secrets Manager, or another external secret manager for the first beta unless Vercel Environment Variables become insufficient.

GitHub Secrets may be used later for CI/CD tokens, but they are not the primary runtime secret store for this stage.

## Required environment variables

Keep the exact required list in `.env.example`.

Current discovered environment variable usage, verified 2026-06-06:

### Required server-only variables

- `ARTDATABANKEN_API_KEY`
  - Used by `lib/repositories/seasonalObservationRepository.ts`.
  - Required for observation-backed seasonal evidence.
  - Must be configured in Vercel Preview and Production scopes before those deployments are accepted as valid beta baselines.

### Optional server-only logging variables

- `MUSHROOM_MOOD_LOG_LEVEL`
  - Used by `lib/utils/observability.ts`.
  - Enables extra logging for values such as `debug`, `verbose`, `true`, `1`, or `on`.
- `ENABLE_VERBOSE_API_LOGGING`
  - Used by `lib/utils/observability.ts`.
  - Enables extra API/payload logging for values such as `debug`, `verbose`, `true`, `1`, or `on`.

### Not currently environment variables

These values are hardcoded or not read from `process.env` in the current app:

- SMHI base URL.
- ArtDatabanken observation search URL.
- iNaturalist API configuration.
- `NEXT_PUBLIC_APP_ENV`.

Do not add these to `.env.example` unless the code is changed to read them.

### Planned beta access-control variables

The `beta-access-control` implementation is expected to add these server-only variables to `.env.example` with placeholder values only and to the relevant Vercel scopes with real values:

- `DATABASE_URL`
  - Postgres connection string used by Drizzle, Auth.js persistence, and feedback persistence.
- `AUTH_SECRET`
  - Auth.js secret.
- `AUTH_URL`
  - Deployed app URL when required by the implemented Auth.js version/host setup.
- `AUTH_TRUST_HOST`
  - Host/proxy trust setting when required by the deployed Auth.js environment.
- `RESEND_API_KEY`
  - Resend API key for magic-link email delivery.
- `EMAIL_FROM`
  - Sender used for beta magic-link emails.
- `BETA_ALLOWED_EMAILS`
  - Comma-separated invite allowlist for beta entry. Values are lowercased and trimmed before comparison.
- `BETA_ADMIN_EMAILS`
  - Comma-separated allowlist for restricted/admin checks. Values are lowercased and trimmed before comparison.

Do not commit real values for these variables. Manual setup of real values and validation identities is required before this slice counts as beta-ready.

## Secret handling

Previously exposed or uncertain credentials have been rotated.

Before beta access:

- Confirm local `.env.local` uses rotated values.
- Confirm Vercel Environment Variables use rotated values.
- Confirm no old credentials remain in committed files, docs, screenshots, archives, logs, or generated files.

Do not record secret values in docs, logs, review files, screenshots, issue comments, or AI chats.

## External API behavior

Mushroom Mood depends heavily on external data.

If required credentials are missing or an external API is failing:

- the readiness flow must not produce normal-looking readiness results,
- the API should return a controlled configuration/dependency error or explicit unavailable/degraded state,
- the UI should make it clear when readiness cannot be calculated,
- the app must not silently fall back to misleading high-confidence output.

The deployment may technically exist while config is missing, but it must not be accepted as a beta baseline.

## Health/config endpoint policy

Do not add a health/config endpoint unless missing-config or dependency behavior cannot be validated cleanly through existing readiness routes and provider logs.

If one is added, it must expose status only and never expose secret values. It must not become a public operational dashboard, and it must not make the `main`/Production deployment publicly usable before app-level auth exists.

## Database workflow

The repository uses Drizzle schema definitions in code and committed SQL migrations for durable database changes.

Current source-of-truth pieces:

- `lib/db/schema.ts`
  - Table definitions for Auth.js persistence and beta feedback persistence.
- `drizzle.config.ts`
  - Drizzle configuration for schema generation, migration output, and database credentials.
- `drizzle/`
  - Committed SQL migrations and Drizzle metadata.

Recommended command usage:

- `npm run db:generate`
  - Generate a new SQL migration after editing `lib/db/schema.ts`.
- `npm run db:migrate`
  - Apply committed migrations to the database referenced by `DATABASE_URL`.
- `npm run db:push`
  - Push the current schema directly to a database without creating a migration.
  - Use this only for disposable local development when you explicitly do not want a committed migration.
- `npm run db:studio`
  - Open Drizzle Studio against the database referenced by `DATABASE_URL`.

Do not rely on runtime table auto-creation in the application. The real database must already be migrated before auth and feedback persistence validation is considered trustworthy.

### Local database workflow

Local development can point directly at a dedicated Neon database.

Store the local Neon connection string in `.env.local` as `DATABASE_URL`.

Apply committed migrations locally:

```bash
npm run db:migrate
```

When changing the schema locally:

```bash
npm run db:generate
npm run db:migrate
```

If the local database needs a clean reset, recreate or reset the dedicated local Neon database, then rerun migrations. Record destructive resets only in local notes, not durable deployment docs.

### Preview and production database workflow

Preview and Production must use real hosted Postgres databases.

Vercel deployments now run the committed Drizzle migrations automatically before the Next.js production build by using the repository `vercel.json` build command.

That means Preview/dev and Production deploys will attempt to apply any unapplied committed migrations against the database referenced by `DATABASE_URL` before the app build completes.

Apply the same committed Drizzle migrations manually only when you intentionally need to migrate a hosted database outside the normal Vercel deploy path.

PowerShell example for applying migrations to Preview/dev from a local machine:

```powershell
$env:DATABASE_URL='postgresql://...preview database url...'
npm run db:migrate
Remove-Item Env:DATABASE_URL
```

PowerShell example for applying migrations to Production from a local machine:

```powershell
$env:DATABASE_URL='postgresql://...production database url...'
npm run db:migrate
Remove-Item Env:DATABASE_URL
```

Operational expectations:

- Local and Preview should use separate Neon databases unless there is a deliberate documented exception.
- Preview and Production should use separate databases unless there is a deliberate documented exception.
- Run migrations before deployed manual validation when a new migration has been added.
- Do not use `db:push` against shared or deployed databases as the normal workflow; use committed migrations instead.

## Baseline validation

Before accepting a deployment as a beta baseline, run:

```bash
npm test
npm run build
```

Also confirm:

- Vercel build logs are visible.
- Runtime errors are diagnosable from provider logs.
- The `dev` Preview deployment works for owner-only live testing.
- The `main` Production deployment is not publicly usable before app-level auth exists.
- Required Vercel environment variables are configured in the correct scopes.
- The correct committed Drizzle migrations have been applied to the Preview or Production database before auth and feedback persistence checks.
- Weather and seasonal evidence calls work or fail safely.
- Missing critical API config does not produce normal-looking readiness results.
- Rollback and disable-beta procedures are understood.

Record validation results in the relevant execution log, release checklist, or change notes. Do not record secret values.

## Rollback procedure

Initial rollback path:

1. Use Vercel rollback/redeploy to restore the previous known-good deployment.
2. Verify that environment variables are still compatible with the restored deployment.
3. Run a smoke check of the restored deployment.
4. Record the rollback in the relevant execution log or incident/change notes.

If rollback is not enough:

1. Revert the problematic Git commit.
2. Push or merge the revert through the normal branch flow.
3. Redeploy.
4. Verify the environment again.

## Disable-beta procedure

If the deployed environment needs to be taken out of use:

1. Remove or disable public/custom-domain access if configured.
2. Tighten Vercel deployment protection.
3. Remove aliases or disable/unpublish the affected deployment if needed.
4. Rotate secrets if exposure is suspected.
5. Record the action in the relevant execution log or incident/change notes.

Before app-level auth is implemented and validated, provider-level disablement is enough. After app-level auth is implemented, the fastest disable-beta option is still provider-level blocking or domain/alias removal, with `BETA_ALLOWED_EMAILS` cleared or tightened as an additional app-level control. Do not build a custom maintenance mode unless it becomes necessary later.

## Docs and UML policy

No feature-flow UML update is expected for deployment-only changes because the user journey should not change.

Update architecture docs or UML if implementation adds a meaningful runtime boundary, such as:

- config-validation module,
- health/config endpoint,
- deployment-platform boundary,
- new external dependency boundary.

If no UML is updated for a deployment change, record why in the relevant execution log or review file.
