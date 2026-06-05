# beta-deployment-foundation Decision Log

## Decision 1 — Deployment provider

Use Vercel as the first deployment provider unless a blocking limitation is discovered during setup.

## Why

Mushroom Mood is a Next.js app, and Vercel provides the lowest-friction path for GitHub-connected Next.js deployments, preview deployments, environment variables, deployment protection, and rollback.

The project is currently a solo spare-time project with limited budget and low expected traffic. Starting with a simple provider is better than introducing Azure, a separate secret manager, or heavier CI/CD infrastructure before beta needs are proven.

## Alternatives considered

- Azure App Service.
- Azure Static Web Apps.
- Netlify.
- Cloudflare Pages.
- Self-hosted deployment.

## Tradeoffs

- Vercel keeps setup simple and cheap for the first beta foundation.
- Vercel keeps deployment/runtime outside GitHub, but GitHub remains the source of truth for code, docs, branches, PRs, and checks.
- Password-style deployment protection may require a paid plan/add-on, but Vercel Authentication is enough for owner-only protected previews before app-level auth exists.
- If long-term needs change, the deployment provider can be revisited later.

## Impacted files or areas

- `docs/deployment.md`
- `.env.example`
- GitHub branch protection settings
- Vercel project settings
- Vercel environment variables

---

## Decision 2 — Deployment environments

Use two deployed environments:

- `dev-live`: deployed from `dev`, protected, owner-only.
- `beta`: deployed from `main`, used by beta testers only after app-level invite-only auth exists.

## Why

The owner wants one live environment for testing changes before promoting them, and one separate environment for beta testers when the app is ready.

This keeps unstable work away from beta testers while still allowing realistic deployed validation.

## Alternatives considered

- Only one beta environment.
- Many preview environments only.
- Separate staging and production branches.
- Full release-branch model.

## Tradeoffs

- Two environments are enough for a solo developer and avoid overcomplication.
- `dev-live` must remain protected so arbitrary visitors cannot use unfinished work.
- `main` must not be considered tester-ready until the later access-control slice is complete.

## Impacted files or areas

- Vercel branch/deployment settings
- GitHub branch workflow
- `docs/deployment.md`
- `docs/plans/active/current-work.md`

---

## Decision 3 — Branch strategy

Use `main` as the protected stable beta-baseline branch and `dev` as the working integration branch.

Small changes may be made directly on `dev`. Larger or risky slices may use `feature/<slice-name>` branches merged into `dev`. Completed slices are promoted with a PR from `dev` to `main`.

Accepted beta baselines should be tagged in Git.

## Why

The project has one developer, so a lightweight branch model is enough. The branch model should still protect the beta baseline and allow live testing before promotion.

## Alternatives considered

- Work directly on `main`.
- GitFlow with release branches.
- Feature branches for every tiny change.
- Trunk-based development with no persistent `dev` branch.

## Tradeoffs

- This keeps the workflow simple.
- `dev` may contain unfinished work, so it must not be tester-facing.
- PRs from `dev` to `main` should be used as the promotion checkpoint.
- Tags provide a simple rollback/reference point for accepted baselines.

## Impacted files or areas

- GitHub branch protection
- GitHub PR workflow
- Vercel branch mapping
- Deployment docs

---

## Decision 4 — Environment variable source of truth

Use `.env.example` as the committed source of truth for required variable names. Use local `.env.local` for local real values and keep it gitignored. Use Vercel Environment Variables for deployed real values.

Do not add an external secret manager for the first beta.

## Why

The app code can read configuration from `process.env`. Locally, Next.js can load values from ignored local env files. In deployed environments, Vercel injects environment variables into the build/runtime environment.

This avoids committing secrets while keeping the setup understandable and cheap.

## Alternatives considered

- Committed `.env` files with placeholder values.
- GitHub Secrets as the main app runtime secret store.
- Azure Key Vault.
- Doppler.
- 1Password Secrets Automation.
- Secret-reference variables that point to an external vault.

## Tradeoffs

- Vercel Environment Variables are simpler than a dedicated external secret manager.
- If deployment later moves away from Vercel, secrets will need to be migrated.
- GitHub Secrets may still be useful later for CI/CD tokens, but they are not the main runtime secret source in this slice.
- Any `NEXT_PUBLIC_` variable must be treated as browser-visible and cannot contain secrets.

## Impacted files or areas

- `.env.example`
- `.gitignore`
- Vercel Environment Variables
- `docs/deployment.md`
- Any code reading `process.env`

---

## Decision 5 — Secret rotation status

Previously exposed or uncertain credentials have been rotated.

Before beta access, confirm that local development and Vercel deployments use the rotated credentials.

## Why

The earlier archive contained a local environment file. Removing it is not enough by itself; rotating credentials is the correct safety action. The user has confirmed rotation is complete.

## Alternatives considered

- Remove the file only.
- Delay rotation until public launch.
- Rotate only selected credentials.

## Tradeoffs

- Rotation may require updating local and provider env vars.
- The execution log must record verification without recording secret values.

## Impacted files or areas

- Local `.env.local`
- Vercel Environment Variables
- External API provider credentials
- Deployment validation checklist

---

## Decision 6 — Temporary deployment protection before app auth

Use Vercel Authentication for protected preview/dev-live deployments before app-level auth exists.

Do not rely on obscure URLs as protection.

## Why

The deployment-foundation slice should create a private environment for the owner. It should not solve beta access inside the app. App-level login and invite-only access belong to the next access-control slice.

## Alternatives considered

- Rely on a hard-to-guess preview URL.
- Add app auth in this slice.
- Use Vercel Password Protection.
- Use Azure App Service Authentication.

## Tradeoffs

- Vercel Authentication is enough for owner-only testing.
- It is not a substitute for app-level invite-only access for beta testers.
- If tester access is needed before app auth exists, that should be treated as a separate decision and risk.

## Impacted files or areas

- Vercel deployment protection settings
- `docs/deployment.md`
- Beta launch checklist

---

## Decision 7 — External API config and failure behavior

Weather and seasonal-observation API configuration is deployment-critical for readiness results.

If required credentials are missing or an external API is failing, the readiness result flow must not produce normal-looking results. It should return a controlled configuration/dependency error or degraded state, and the UI should explain that readiness cannot be calculated right now.

## Why

Mushroom Mood depends heavily on external data. A plausible but unsupported readiness result is more harmful than a clear temporary failure.

## Alternatives considered

- Block entire app startup whenever credentials are missing.
- Allow static fallback silently.
- Allow readiness calculation to proceed with missing data.
- Treat missing credentials as only a log warning.

## Tradeoffs

- Blocking normal readiness output is safer than silently generating misleading results.
- Full startup blocking may be awkward in some serverless/deployment models.
- The practical rule is: deployment can exist, but it cannot be accepted as a beta baseline if critical config is missing.
- Controlled errors give better debugging and user trust than crashes or fake confidence.

## Impacted files or areas

- Readiness API route or service
- External API clients
- Config/env validation helper, if added
- UI error/degraded-state copy
- `docs/deployment.md`
- Manual review checklist

---

## Decision 8 — Persistence

No new persistence is introduced in this slice.

Auth storage, invite lists, feedback storage, and reviewable feedback records belong to later slices.

## Why

Deployment foundation should stay narrow. The goal is to establish the private deployed environment and safe config behavior, not to implement beta features.

## Alternatives considered

- Add database/storage now.
- Add feedback persistence now.
- Add invite-list persistence now.

## Tradeoffs

- This keeps deployment foundation simpler.
- Future slices may require revisiting provider/database choices.
- The app should not collect beta feedback or invite users during this slice.

## Impacted files or areas

- Beta access-control slice
- Feedback-capture slice
- Future persistence planning

---

## Decision 9 — Rollback and disable-beta path

Use provider rollback as the first recovery path. Also document how to disable or remove access to the beta/dev-live environment if needed.

Rollback and disable-beta steps must be documented in `docs/deployment.md`.

## Why

A bad deployment should have a simple recovery procedure before testers are invited. Because this slice is deployment foundation, the rollback/disable approach should be platform-level and documented rather than overbuilt in app code.

## Alternatives considered

- Build custom maintenance mode now.
- Rely only on Git revert.
- Rely only on redeploying from the latest branch.
- Defer rollback planning until public launch.

## Tradeoffs

- Provider rollback is fast and simple.
- Rollback may not fix bad environment variables, so config must be checked after rollback.
- Disable-beta is a separate safety action from rollback.

## Impacted files or areas

- Vercel deployments
- Git tags
- `docs/deployment.md`
- Execution log
- Manual review checklist

---

## Decision 10 — CI/deployment split

Use GitHub Actions for checks such as tests/build if needed. Use Vercel Git integration for deployment at first.

Only move deployment into GitHub Actions later if direct Vercel deployment becomes too limiting.

## Why

The user wants GitHub to remain central, but the simplest first deployment path is Vercel's GitHub integration. GitHub can remain the project home while Vercel handles hosting/runtime/secrets/deployments.

## Alternatives considered

- Deploy only through GitHub Actions and Vercel CLI.
- Keep all checks manual.
- Use another CI/CD provider.

## Tradeoffs

- Direct Vercel deployment reduces setup.
- GitHub Actions can still provide visible checks and branch protection.
- Moving deployment into GitHub Actions later remains possible.

## Impacted files or areas

- GitHub Actions workflows, if present or added
- Vercel Git integration
- GitHub branch protection
- `docs/deployment.md`
