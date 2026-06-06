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

## Vercel Project Setup (Initial Configuration)

### Prerequisites

- GitHub repository owner/admin access
- Vercel account (free tier is sufficient for initial beta)
- Repository already has `main` (stable) and `dev` (working) branches

### Step 1: Create Vercel Project

1. Go to https://vercel.com/new
2. Select "Next.js" or "Import Project"
3. Connect to the GitHub repository (select `mushroom-mood` repo)
4. Vercel will auto-detect it as a Next.js project
5. Set project name (e.g., `mushroom-mood` or `mushroom-mood-beta`)
6. In "Framework Preset", ensure "Next.js" is selected
7. In "Root Directory", leave as `.` (default)
8. Click "Deploy" to create the initial deployment from `main`

### Step 2: Configure GitHub Integration

1. In Vercel project settings → Git Integrations
2. Ensure GitHub is connected and the correct repo is selected
3. Auto-deployment should be enabled by default

### Step 3: Configure Deployment Branches

In Vercel project settings → Deployments:

1. **Production (main branch)**
   - Automatically deploy from `main`
   - Production domain: (auto-assigned by Vercel)
   - Mark as "Production" environment
   - Protection: See "Branch Protection" below

2. **Preview (dev branch and PRs)**
   - Automatically deploy from `dev` branch
   - Mark as "Preview" environment
   - Automatically preview feature branches

### Step 4: Set Environment Variables in Vercel

Go to Settings → Environment Variables and add the following (no values in this doc):

**For Preview (dev deployments):**
- NEXT_PUBLIC_APP_ENV = dev
- ARTDATABANKEN_API_KEY = [rotated value]
- MUSHROOM_MOOD_LOG_LEVEL = debug (optional)
- ENABLE_VERBOSE_API_LOGGING = true (optional)

**For Production (main/beta-baseline):**
- NEXT_PUBLIC_APP_ENV = beta
- ARTDATABANKEN_API_KEY = [rotated value]
- MUSHROOM_MOOD_LOG_LEVEL = (optional)
- ENABLE_VERBOSE_API_LOGGING = (optional)

Ensure variable scopes match:
- Preview scope for `dev` deployments
- Production scope for `main` deployments

### Step 5: Protect main/Beta-Baseline Before App-Level Auth

Before app-level invite-only auth exists, the `main`/beta-baseline deployment must not be publicly accessible.

Choose one or more of these controls in Vercel Settings → Deployment Protection:

1. **Vercel Authentication** (recommended for initial beta)
   - Enable "Vercel Authentication" on the Production deployment
   - Only Vercel account members can access
   - Settings → Deployment Protection → Vercel Authentication

2. **Disable Production Domain**
   - Settings → Domains
   - Remove or disable the production domain if not needed yet
   - Deployment still works, just no public URL

3. **Custom Domain with Auth** (if using a custom domain later)
   - Assign custom domain to Preview/dev deployment only
   - Keep Production deployment on Vercel's auto-assigned internal URL with Vercel Auth enabled

4. **Preview Deployments Only**
   - Keep Production deployment but do not assign a public-facing domain
   - Access only via Preview/dev deployment for testing

### Step 6: Verify Initial Deployment

After the first deployment completes:

1. Check Vercel project dashboard for successful build
2. Test the Preview URL for `dev` branch
3. Verify `main`/Production is not publicly accessible (or behind auth)
4. Confirm build logs are visible
5. Check that environment variables are correctly injected (test via app logs or endpoint responses)

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

Discovered environment variable usage (verified 2026-06-06):

```text
Env-var discovery method:
  - Full repo search for process.env, NEXT_PUBLIC_, and framework config
  - Search included: lib/, app/api/, tests/
  - Code review of: repositories, services, utils

Required server-only variables:
  - ARTDATABANKEN_API_KEY
    * Used by: SeasonalObservationRepository
    * Impact if missing: Seasonal observations return 'missing' quality, confidence reduced by 20%,
      readiness falls back to static species calendar, prevents misleading results
    * Config failure test: lib/repositories/seasonalObservationRepository.test.ts
                          'returns missing evidence without making any network call'

Public variables (NEXT_PUBLIC_):
  - NEXT_PUBLIC_APP_ENV
    * Used for: Environment identification (dev, beta, production, etc.)
    * Safe for browser: Yes

Logging variables (optional, no secrets):
  - MUSHROOM_MOOD_LOG_LEVEL
    * Values: 'debug', 'verbose', 'true', '1', or 'on' to enable
  - ENABLE_VERBOSE_API_LOGGING
    * Values: 'debug', 'verbose', 'true', '1', or 'on' to enable

Variables with hardcoded defaults (optional):
  - SMHI_API_BASE_URL (defaults to https://opendata-download-metobs.smhi.se/api)
  - SMHI_API_KEY (SMHI service is public; key not required)
  - ARTDATABANKEN_API_BASE_URL (has default value)
  - INATURALIST_API_BASE_URL (has default value)
  - INATURALIST_API_KEY (future expansion, not actively used)
```

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
