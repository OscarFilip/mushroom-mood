# Deployment

Mushroom Mood is deployed on Vercel.

This document describes the current deployment model, required config, and safe rollback/disable procedures.

## Live environments

| Environment | Branch/source | Domain | Purpose |
| --- | --- | --- | --- |
| Production | `main` | [mushroommood.se](https://mushroommood.se) | Production/beta baseline |
| Preview/dev | `dev` | [dev.mushroommood.se](https://dev.mushroommood.se) | Development validation in a deployed environment |
| Preview | PRs and feature branches | Vercel preview URL | Temporary branch validation |
| Local | local machine | `localhost` | Local development |

Production and dev should use separate runtime configuration and database resources unless a deliberate exception is documented.

## Provider

Current provider: **Vercel**.

Current model: **one Vercel project** connected to GitHub.

Why Vercel fits this stage:

- good Next.js support
- GitHub integration
- preview deployments
- environment variables for runtime secrets
- rollback/redeploy support
- low setup cost for a small beta

## Branch and promotion flow

```text
feature/<slice-name> -> dev -> main
```

Branch roles:

- `dev`: integration branch for deployed dev validation
- `main`: production branch
- `feature/<slice-name>`: optional branch for larger or riskier work

Before promoting to `main`:

```bash
npm test
npm run build
```

Also confirm that required environment variables are present in the correct Vercel scope.

## Environment variables

Keep variable names in `.env.example`. Keep real values in `.env.local` or Vercel Environment Variables.

Do not commit real secrets.

### Required server-side variables

- `DATABASE_URL`
- `ARTDATABANKEN_API_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `BETA_ALLOWED_EMAILS`
- `BETA_ADMIN_EMAILS`

Auth secret configuration:

- `NEXTAUTH_SECRET` or `AUTH_SECRET`

Auth URL configuration, depending on environment and Auth.js behavior:

- `NEXTAUTH_URL` or `AUTH_URL`
- `AUTH_TRUST_HOST` when needed by the deployed host/proxy setup

### Optional logging variables

- `MUSHROOM_MOOD_LOG_LEVEL`
- `ENABLE_VERBOSE_API_LOGGING`

Variables prefixed with `NEXT_PUBLIC_` are browser-visible and must never contain secrets.

## Database workflow

The app uses Drizzle schema definitions and committed SQL migrations.

Source-of-truth files:

- `lib/db/schema.ts`
- `drizzle/`

Common commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

Use `npm run db:push` only for disposable local development when you intentionally do not want a committed migration.

Vercel deployments run committed Drizzle migrations before the Next.js production build through the repository `vercel.json` build command.

## External API behavior

Mushroom Mood depends on external data from SMHI and ArtDatabanken.

If required credentials are missing or an external API fails, the app should:

- fail safely
- avoid normal-looking high-confidence results
- show a clear unavailable or degraded state
- log enough information to debug the issue without exposing secrets

## Baseline validation

Before accepting a deployment as a beta or production baseline, check:

- `npm test` passes
- `npm run build` passes
- Vercel build logs are visible
- required environment variables are configured in the right scope
- database migrations have run against the right database
- auth, feedback, weather, and seasonal evidence flows work or fail safely
- rollback and disable-beta steps are understood

Record validation results in the relevant execution log, release checklist, or change notes. Do not record secret values.

## Rollback

Initial rollback path:

1. Use Vercel rollback/redeploy to restore the previous known-good deployment.
2. Confirm environment variables are still compatible with the restored version.
3. Run a smoke check.
4. Record the rollback in the relevant log or change notes.

If rollback is not enough:

1. Revert the problematic Git commit.
2. Merge or push the revert through the normal branch flow.
3. Redeploy.
4. Run the same validation checks again.

## Disable beta access

Fastest disable path:

1. Tighten Vercel deployment protection or remove public aliases/domains.
2. Clear or restrict `BETA_ALLOWED_EMAILS`.
3. Rotate secrets if exposure is suspected.
4. Record the action in the relevant log or incident notes.

Do not build a custom maintenance mode unless provider-level blocking and allowlist control become insufficient.

## Docs and diagrams

Update this file when deployment, environment, database, or rollback behavior changes.

Update architecture docs or diagrams only when the implementation adds a meaningful runtime boundary, such as a config-validation module, health endpoint, deployment-platform boundary, or new external dependency boundary.
