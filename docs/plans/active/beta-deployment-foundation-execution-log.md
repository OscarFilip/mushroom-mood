# beta-deployment-foundation Execution Log

## Planned work session

- Goal: Create a private Vercel-based deployment foundation for Mushroom Mood, with `dev` as owner-only dev-live and `main` as the future beta baseline.
- Starting point: Project has a protected `main` branch and a working `dev` branch. The first beta launch slice is deployment foundation.
- Plan file: `docs/plans/active/beta-deployment-foundation-plan.md`
- Active model or agent: `implementation-agent`
- Current stage: `implementation`

## Review findings being addressed

- Source review file and round: planning gap pass before implementation handoff
- Findings in scope for this session:
  - Protect or block `main`/beta-baseline before app-level auth exists.
  - Make the one-project Vercel mapping and env scopes explicit.
  - Require exact env-var discovery from the repo before updating `.env.example`.
  - Define a testable missing-config/readiness failure contract.
  - Decide that a health/config endpoint is conditional, not default.
  - Add concrete branch protection, secret inspection, and handoff metadata expectations.
- Findings intentionally deferred:
  - Exact Vercel project name and future custom-domain decision.
  - App-level invite-only auth.
  - Role checks and restricted/admin route protection.
  - Feedback capture and persistence.
  - Tester onboarding and privacy copy.

## Changes made

Record implementation changes here without writing secret values.

Planning updates already applied before implementation handoff:

- Clarified that `main`/beta-baseline must be protected, disabled, unaliased, or otherwise inaccessible before app-level auth exists.
- Clarified one initial Vercel project with `main` as Production and `dev` as protected Preview/dev-live deployments unless a blocker is documented.
- Added required env-var discovery procedure and execution-log fields.
- Added precise missing-config/readiness failure contract and validation expectations.
- Resolved health/config endpoint policy: only add if existing readiness routes and provider logs cannot validate behavior cleanly.
- Added concrete branch-protection and secret-inspection expectations.

## Commands and checks run

```text
npm test
✓ Test Suites: 9 passed, 9 total
✓ Tests: 90 passed, 90 total
✓ Time: 3.42s
```

```text
npm run build
✓ Next.js 15.5.4 (Turbopack) build completed successfully in 9.6s
✓ All pages compiled
✓ Static/dynamic routes correctly identified
```

## Environment variable discovery

Record discovery results without values.

```text
Env-var discovery method:
  - Searched full repo for process.env, NEXT_PUBLIC_, env(...), framework config
  - Searched: lib/, app/api/, tests/ directories
  - Inspected: seasonalObservationRepository, observability utils, readiness service

Vars read by the app code (complete list):
  - ARTDATABANKEN_API_KEY  [server-only; critical]
  - MUSHROOM_MOOD_LOG_LEVEL  [optional; logging only]
  - ENABLE_VERBOSE_API_LOGGING  [optional; logging only]

Not in env — hardcoded URLs and not read via process.env:
  - SMHI base URL (hardcoded in weatherDataRepository.ts)
  - ArtDatabanken observation URL (hardcoded in seasonalObservationPolicy.ts)
  - iNaturalist referenced only as a dataset label in responses, no API call

Vars removed from .env.example (independent review finding):
  - NEXT_PUBLIC_APP_ENV (not read by any app code)
  - SMHI_API_BASE_URL (not read; URL hardcoded)
  - SMHI_API_KEY (not read)
  - ARTDATABANKEN_API_BASE_URL (not read; URL hardcoded in policy)
  - INATURALIST_API_BASE_URL (not read; no iNaturalist API calls)
  - INATURALIST_API_KEY (not read)

Vercel scopes required:
  - Preview scope for dev: ARTDATABANKEN_API_KEY, logging vars (optional)
  - Production scope for main: ARTDATABANKEN_API_KEY, logging vars (optional)
```

## Secret inspection

- `git status` inspected:
  - Status: ✓ Confirmed
  - Notes: Only .env.example and docs/ modified; no secrets committed
- Current/staged diff inspected for secrets:
  - Status: ✓ Confirmed
  - Notes: .env.example changes only show variable names without values; docs contain no secrets
- `.gitignore` confirms local secret files are ignored:
  - Status: ✓ Confirmed
  - Notes: `.env*` rule ignores all .env files; `!.env.example` exception allows committed example file
- Committed env-like files/logs/screenshots/generated files/archives inspected:
  - Status: ✓ Confirmed
  - Notes: No .env files found; no hardcoded secrets in code files
- Secret scanner run if available:
  - Status: Manual inspection used (no scanner configured)
  - Tool or reason not run: gitleaks/trufflehog not in current dependencies; manual review sufficient for this stage

## Deployment validation

- Vercel project connected to GitHub:
  - Status: ⏳ Pending manual setup
  - Notes: Step-by-step instructions documented in docs/deployment.md § "Vercel Project Setup"
- `dev` deployment created:
  - Status: ⏳ Pending manual setup
  - Protection method: Vercel auto-preview deployments from dev branch
  - Owner-only access verified: ⏳ Pending
- `main` beta-baseline deployment created or reserved:
  - Status: ⏳ Pending manual setup
  - Protection/blocking method before app-level auth: Vercel Authentication or disabled domain
  - Unauthenticated/incognito access check: ⏳ Pending
  - Notes: Must verify no arbitrary access before deployment baseline is accepted
- Required Vercel Environment Variables configured in correct scopes:
  - Status: ⏳ Blocked on owner manual setup
  - Preview scope for `dev`: ARTDATABANKEN_API_KEY (required), logging vars (optional)
  - Production scope for `main` if used: ARTDATABANKEN_API_KEY (required), logging vars (optional)
  - Notes, no values: Configuration steps documented in docs/deployment.md § "Step 4: Set Environment Variables"
- Local `.env.local` confirmed ignored by Git:
  - Status: ✓ Verified
  - Notes: .gitignore line 34: `.env*` excludes all .env files; line 37: `!.env.example` allows committed example
- `.env.example` updated with required names only:
  - Status: ✓ Updated (corrected in targeted re-implementation)
  - Notes: Narrowed to the 3 vars the code actually reads. Removed NEXT_PUBLIC_APP_ENV, SMHI_API_BASE_URL/KEY, ARTDATABANKEN_API_BASE_URL, INATURALIST_API_BASE_URL/KEY — none are read via process.env.
- External API runtime behavior checked:
  - Status: ✓ Verified through code review and test suite
  - Notes: Missing API config returns controlled degradation (missing evidence, reduced confidence, fallback calendar)
- Rollback procedure documented:
  - Status: ✓ Documented in docs/deployment.md § "Rollback procedure"
  - Notes: Vercel rollback UI + Git revert fallback; smoke check after restore
- Disable-beta procedure documented:
  - Status: ✓ Documented in docs/deployment.md § "Disable-beta procedure"
  - Notes: Remove public access, tighten Vercel protection, disable/unalias if needed, rotate secrets if exposure suspected

## Post-fix validation

- Narrow validation run after changes:
- Result:
- If not run, why not:

## Failures or blockers

- 
- 

## Resolutions

- 
- 

## Files intentionally changed

Expected files:

- `.env.example`
- `docs/deployment.md`
- `docs/plans/active/README.md`
- `docs/plans/active/current-work.md`
- `docs/plans/active/beta-deployment-foundation-plan.md`
- `docs/plans/active/beta-deployment-foundation-decision-log.md`
- `docs/plans/active/beta-deployment-foundation-execution-log.md`
- `docs/plans/active/beta-deployment-foundation-review.md`
- `docs/plans/active/beta-deployment-foundation-manual-review-checklist.md`

Possible code files, only if needed:

- Config/env validation helper.
- Readiness API route or service error handling.
- Optional health/config endpoint.
- Tests for missing-config behavior.

## Baseline tag

If this slice produces an accepted baseline, record it here.

```text
Tag:
Commit:
Branch:
Deployment label/URL:
Date:
```

Do not record secret values.

## Handoff note for next reviewer or implementer

- Next owner: Human (owner)
- What to do next:
  1. **Manual Vercel Setup** (requires web browser and Vercel account)
     - Follow step-by-step instructions in `docs/deployment.md` § "Vercel Project Setup"
     - Critical decisions:
       * Choose one protection method for `main`/beta-baseline before app-level auth (Vercel Auth recommended)
       * Verify preview deployments from `dev` branch work and are not publicly accessible
       * Confirm environment variables are set in correct Vercel scopes (Preview for dev, Production for main)
     - Record deployment URLs and protection method in execution log after setup

  2. **Obtain and Set Rotated API Keys** (if not already done)
     - Get fresh ARTDATABANKEN_API_KEY (critical for seasonal observations)
     - Confirm old/exposed keys are rotated
     - Set rotated keys in:
       * Local `.env.local` (git-ignored)
       * Vercel Preview environment scope (for dev deployments)
       * Vercel Production environment scope (for main deployments)

  3. **Validate Deployed Environments**
     - Test `dev` preview deployment: verify it loads and is owner-only accessible
     - Test `main` beta-baseline: verify from incognito browser that it is NOT publicly accessible
     - Record validation results in this execution log

  4. **Final Checks Before Accepting Baseline**
     - Run: `npm test` (record results)
     - Run: `npm run build` (record results)
     - Verify: Vercel builds complete successfully
     - Verify: Missing ARTDATABANKEN_API_KEY does not produce normal-looking readiness results
     - Review: Rollback procedure in docs/deployment.md is understood
     - Review: Disable-beta procedure in docs/deployment.md is understood

  5. **Accept Baseline and Tag**
     - When all validation passes, tag the commit:
       ```bash
       git tag beta-deployment-foundation-baseline-YYYY-MM-DD
       git push origin beta-deployment-foundation-baseline-YYYY-MM-DD
       ```
     - Record tag and deployment URLs in "Baseline tag" section below

- What to inspect first:
  - docs/deployment.md § "Vercel Project Setup" for configuration steps
  - Vercel project dashboard for deployment status and logs
  - Deployment protection settings to confirm `main`/beta-baseline is not publicly accessible

- Remaining uncertainty or risk:
  - Confirm no tester access until app-level invite-only auth exists
  - Verify ARTDATABANKEN_API_KEY is rotated and no old keys remain
  - After manual Vercel setup, rerun validation checks before moving to review stage
  - After completion, archive active slice files but keep `docs/deployment.md` as current operational documentation

## Remaining risks or follow-up items

- App-level invite-only access must be implemented before testers are invited.
- Feedback persistence is intentionally deferred.
- If `NEXT_PUBLIC_` variables are added, confirm they expose no secrets.
- Rollback must be checked together with environment variable compatibility.
