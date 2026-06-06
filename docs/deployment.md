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

For the current pre-auth beta stage, provider-level disablement is enough. Do not build a custom maintenance mode unless it becomes necessary later.

## Docs and UML policy

No feature-flow UML update is expected for deployment-only changes because the user journey should not change.

Update architecture docs or UML if implementation adds a meaningful runtime boundary, such as:

- config-validation module,
- health/config endpoint,
- deployment-platform boundary,
- new external dependency boundary.

If no UML is updated for a deployment change, record why in the relevant execution log or review file.
