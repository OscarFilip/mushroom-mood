# Deployment

This document describes the first deployment foundation for Mushroom Mood.

The current goal is to create a private beta-like environment where the app can be tested realistically. Deployment foundation is not beta launch approval.

## Provider

Initial provider: **Vercel**.

Reasons:

- Good fit for a Next.js app.
- Low-friction GitHub integration.
- Preview deployments.
- Environment variables for deployed secrets.
- Deployment protection for owner-only testing.
- Rollback support.
- Cheap/free starting point for a solo low-traffic beta.

If Vercel becomes a blocker, record the blocker and alternative in `docs/plans/active/beta-deployment-foundation-decision-log.md`.

## Environments

| Environment | Branch | Audience | Purpose |
| --- | --- | --- | --- |
| Local development | local working copy | Owner | Local development and tests. |
| Dev-live / preview | `dev` | Owner only | Live deployed testing before promotion. |
| Beta baseline | `main` | Beta testers later | Tester-facing environment after app-level invite-only auth exists. |

## Important rule

The beta baseline environment must not be considered tester-ready until app-level invite-only access exists.

Deployment foundation proves the app can deploy and be validated. It does not prove the app is safe to invite testers into.

## Branch strategy

- `main`
  - Protected stable branch.
  - Source for the future beta baseline.
  - Only updated after checks and review.
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

Small solo-dev changes may be made directly on `dev` when the risk is low.

Accepted beta baselines should be tagged, for example:

```bash
git tag beta-deployment-foundation-0
git push origin beta-deployment-foundation-0
```

or:

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

Do not make committed `.env` files point to a secret vault for the first beta. That is a valid pattern in some enterprise stacks, but it adds provider complexity that is not needed yet.

### Public variables

Variables prefixed with `NEXT_PUBLIC_` are browser-visible and must never contain secrets.

Only use `NEXT_PUBLIC_` for safe public values, such as:

```env
NEXT_PUBLIC_APP_ENV=
```

### External secret providers

Do not introduce Azure Key Vault, Doppler, 1Password Secrets Automation, AWS Secrets Manager, or another external secret manager for the first beta unless Vercel Environment Variables become insufficient.

GitHub Secrets may be used later for CI/CD tokens, but they are not the primary runtime secret store for this slice.

## Required environment variables

Keep the exact list in `.env.example`.

During implementation, confirm which variables are actually required by the current code.

Expected categories:

- App environment label.
- Weather API base URL and/or credentials if required.
- Seasonal/observation API base URL and/or credentials if required.
- Any server-only API keys used by readiness calculations.

Never put real values in this document.

## Secret rotation

Previously exposed or uncertain credentials have been rotated.

Before beta access:

- Confirm local `.env.local` uses rotated values.
- Confirm Vercel Environment Variables use rotated values.
- Confirm no old credentials remain in committed files, docs, screenshots, archives, logs, or generated files.

## External API behavior

Mushroom Mood depends heavily on external data.

Required weather and seasonal-observation API configuration is deployment-critical for readiness results.

If required credentials are missing or an external API is failing:

- The readiness result flow must not produce normal-looking results.
- The API should return a controlled configuration/dependency error or degraded state.
- The UI should explain that readiness cannot be calculated right now.
- The app must not silently fall back to misleading high-confidence output.

The deployment may technically exist while config is missing, but it must not be accepted as a beta baseline.

## Validation before accepting a deployment baseline

Run locally:

```bash
npm test
npm run build
```

Validate in the deployed environment:

- App loads in the protected dev-live/preview environment.
- Arbitrary visitors cannot access the protected dev-live environment.
- Required environment variables are configured in Vercel.
- Build logs are visible.
- Runtime errors are visible.
- Weather/seasonal evidence calls work or fail safely.
- Missing critical API config does not produce normal-looking readiness results.
- Rollback/disable-beta procedure is understood.

Record results in:

```text
docs/plans/active/beta-deployment-foundation-execution-log.md
```

Do not record secret values.

## Rollback procedure

Initial rollback path:

1. Use Vercel's rollback/redeploy capability to restore the previous known-good deployment.
2. Verify that environment variables are still compatible with the restored deployment.
3. Run a smoke check of the restored deployment.
4. Record the rollback in the execution log.

If rollback is not enough:

1. Revert the problematic Git commit.
2. Push or merge the revert through the normal branch flow.
3. Redeploy.
4. Verify the environment again.

## Disable-beta procedure

If the deployed environment needs to be taken out of use:

1. Remove or disable public/custom-domain access if configured.
2. Tighten Vercel deployment protection.
3. Disable or remove the affected deployment if needed.
4. Rotate secrets if exposure is suspected.
5. Record the action in the execution log.

For this slice, provider-level disablement is enough. Do not build a custom maintenance mode unless it becomes necessary later.

## Docs and UML policy

No feature-flow UML update is expected for deployment foundation because the user journey should not change.

Update architecture docs or UML only if implementation adds a meaningful runtime boundary, such as:

- Config-validation module.
- Health/config endpoint.
- Deployment-platform boundary.
- New external dependency boundary.

If no UML is updated, record why in the execution log or review file.

## Next slice

After deployment foundation is complete, the recommended next active slice is:

```text
beta-access-control
```

That slice should implement app-level login/sign-in, invite-only access, role checks, and restricted/admin route protection before beta testers are invited.
