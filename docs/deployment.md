# Deployment

This document describes the current deployment model for Mushroom Mood.

It is durable operational documentation. Keep it current as deployment choices change; do not archive it when a planning slice is completed.

Temporary planning notes, implementation logs, review findings, and slice-specific open questions belong in `docs/plans/`. When any deployment-related slice is finished, archive its slice-specific plan, decision log, execution log, review file, and manual checklist according to the project archive process, but keep this file as the canonical deployment reference.

## Responsibility

This file should answer: "How does deployment work now, and how do we operate it safely?"

It should contain current, relevant facts about:

- deployment provider,
- environment and branch mapping,
- access/protection expectations,
- environment variable and secret handling,
- deployment validation,
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
- detailed provider click-by-click setup notes unless they remain operationally useful.

If a deployment decision changes, update this file and record the why in the relevant decision log or project history.

## Provider

Current provider: **Vercel**.

Project model: **one Vercel project** connected to GitHub, unless a documented blocker changes this model. In that project, `main` is the Production branch and `dev` uses protected Preview/dev-live deployments.

Reasons:

- Good fit for a Next.js app.
- Low-friction GitHub integration.
- Preview deployments.
- Environment variables for deployed secrets.
- Deployment protection for owner-only testing.
- Rollback support.
- Cheap/free starting point for a solo low-traffic beta.

If Vercel becomes a blocker or the provider changes, update this document and record the decision in the relevant plan/decision log.

## Environments

| Environment | Branch | Audience | Purpose |
| --- | --- | --- | --- |
| Local development | local working copy | Owner | Local development and tests. |
| Dev-live / preview | `dev` | Owner only | Live deployed testing before promotion. |
| Beta baseline | `main` | Owner only before auth; beta testers later | Tester-facing environment only after app-level invite-only auth exists. Before then, it must be protected, disabled, unaliased, or otherwise inaccessible to arbitrary visitors. |

## Important rule

The beta baseline environment must not be considered tester-ready until app-level invite-only access exists.

Before app-level auth exists, the `main`/beta-baseline deployment must not be publicly usable by arbitrary visitors. Use one or more of these controls: Vercel Authentication, disabled/unpublished production deployment, no public/custom-domain alias, or another provider-level access block. Do not rely on obscure URLs as protection.

Deployment foundation proves the app can deploy and be validated. It does not prove the app is safe to invite testers into.

## Branch strategy

- `main`
  - Protected stable branch.
  - Source for the future beta baseline.
  - No direct pushes unless the owner explicitly accepts a one-off exception.
  - Only updated after checks and review.
  - Must not become publicly usable before app-level invite-only access exists.
- `dev`
  - Working integration branch.
  - Source for the protected dev-live/preview deployment.
  - Used by the owner to test changes in a real deployed environment.
- `feature/<slice-name>`
  - Optional for larger or risky work.
  - Merged into `dev` before promotion.

Promotion flow:

```text
feature/<slice-name> → dev → main
```

Minimum protection expectations:

- Promotion from `dev` to `main` happens through a PR or explicit manual review checkpoint.
- `npm test` and `npm run build` results are recorded before promotion.
- Branch rules can be manual at first, but if GitHub Actions checks already exist or are added, they should be required before merging to `main`.
- Accepted beta baselines are tagged so the exact code revision can be identified later.

Small solo-dev changes may be made directly on `dev` when the risk is low.

Accepted beta baselines should be tagged, for example:

```bash
git tag beta-baseline-YYYY-MM-DD
git push origin beta-baseline-YYYY-MM-DD
```

## Environment variables and secrets

### Source of truth

Use three layers:

```text
.env.example
→ committed to the repo
→ contains required variable names only
→ no real values

.env.local
→ local development only
→ contains real local values
→ must be ignored by Git

Vercel Environment Variables
→ deployed real values
→ configured in Vercel
→ never committed to the repo
```

The app should read values from `process.env`.

Vercel variable scopes must match the environments actually used:

- Preview scope for `dev` preview/dev-live deployments.
- Production scope for `main` if the production/beta-baseline deployment is created or reserved.
- Development scope only when Vercel local development uses it.

Do not assume a variable configured in one Vercel scope is available in another.

Do not make committed `.env` files point to a secret vault for the first beta. That is a valid pattern in some enterprise stacks, but it adds provider complexity that is not needed yet.

### Public variables

Variables prefixed with `NEXT_PUBLIC_` are browser-visible and must never contain secrets.

Only use `NEXT_PUBLIC_` for safe public values, such as:

```env
NEXT_PUBLIC_APP_ENV=
```

### External secret providers

Do not introduce Azure Key Vault, Doppler, 1Password Secrets Automation, AWS Secrets Manager, or another external secret manager for the first beta unless Vercel Environment Variables become insufficient.

GitHub Secrets may be used later for CI/CD tokens, but they are not the primary runtime secret store for this stage.

## Required environment variables

Keep the exact list in `.env.example`.

Before `.env.example` is changed, confirm which variables are actually required by the current code. Search the full repo for:

- `process.env`
- `NEXT_PUBLIC_`
- `env(...)`
- `import.meta.env`, if present
- framework or provider config that reads environment variables

Record this discovery in the relevant execution log or implementation notes without values:

```text
Env-var discovery method:
Required server-only vars:
Required public vars:
Vars intentionally optional:
Vars removed/renamed:
```

Expected categories:

- App environment label.
- Weather API base URL and/or credentials if required.
- Seasonal/observation API base URL and/or credentials if required.
- Any server-only API keys used by readiness calculations.

Never put real values in this document.

## Secret rotation and inspection

Previously exposed or uncertain credentials must be rotated before beta access.

Before beta access:

- Confirm local `.env.local` uses rotated values.
- Confirm Vercel Environment Variables use rotated values.
- Confirm no old credentials remain in committed files, docs, screenshots, archives, logs, or generated files.

Before review or promotion, inspect:

- `git status`
- the current diff and any staged diff
- `.gitignore` entries for `.env*.local` or equivalent local secret files
- committed env-like files, if any
- logs, screenshots, generated files, and archives that are part of the diff

Run a secret scanner such as gitleaks or trufflehog if already available in the repo/tooling. If no scanner is available, record that manual inspection was used. Do not record secret values.

## External API behavior

Mushroom Mood depends heavily on external data.

Required weather and seasonal-observation API configuration is deployment-critical for readiness results.

If required credentials are missing or an external API is failing:

- The readiness result flow must not produce normal-looking results.
- The API should return either a controlled non-2xx configuration/dependency error or an explicit degraded/unavailable result such as `readinessUnavailable` or equivalent.
- The UI should explain that readiness cannot be calculated right now.
- The app must not silently fall back to misleading high-confidence output.

Validation must include at least one of:

- automated test with env/config mocked as missing,
- local manual run with required env intentionally omitted,
- deployed safe check in a non-public environment.

Record the route or action tested, expected result, actual result, and whether UI copy was visible.

The deployment may technically exist while config is missing, but it must not be accepted as a beta baseline.

## Health/config endpoint policy

Do not add a health/config endpoint unless missing-config/dependency behavior cannot be validated cleanly through existing readiness routes and provider logs.

If one is added, it must expose status only, never secret values. It must not become a public operational dashboard, and it must not make the `main`/beta-baseline deployment publicly usable before app-level auth exists.

## Validation before accepting a deployment baseline

Run locally:

```bash
npm test
npm run build
```

Validate in the deployed environment:

- App loads in the protected dev-live/preview environment.
- Arbitrary visitors cannot access the protected dev-live environment.
- Required environment variables are configured in the correct Vercel scopes.
- Env-var discovery results are recorded without values.
- Build logs are visible.
- Runtime errors are visible.
- Weather/seasonal evidence calls work or fail safely.
- Missing critical API config does not produce normal-looking readiness results.
- `main`/beta-baseline is checked from an unauthenticated/incognito browser session and confirmed not publicly usable before app-level auth.
- Rollback/disable-beta procedure is understood.

Record validation results in the relevant execution log, release checklist, or change notes. Do not record secret values.

## Rollback procedure

Initial rollback path:

1. Use Vercel's rollback/redeploy capability to restore the previous known-good deployment.
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

- Config-validation module.
- Health/config endpoint.
- Deployment-platform boundary.
- New external dependency boundary.

If no UML is updated for a deployment change, record why in the relevant execution log or review file.
