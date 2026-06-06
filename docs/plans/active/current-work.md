# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`beta-deployment-foundation`

## Stage

`review`

Allowed values:

- `planning`
- `implementation`
- `review`

## Current owner

`human`

Examples:

- `planning-agent`
- `implementation-agent`
- `review-agent`
- `human`

## Current review round

`independent-review-1`

Examples:

- `not-started`
- `self-check-1`
- `independent-review-1`
- `targeted-rereview-1`
- `complete`

## Primary files

- Plan: `docs/plans/active/beta-deployment-foundation-plan.md`
- Decision log: `docs/plans/active/beta-deployment-foundation-decision-log.md`
- Execution log: `docs/plans/active/beta-deployment-foundation-execution-log.md`
- Review: `docs/plans/active/beta-deployment-foundation-review.md`
- Manual checklist: `docs/plans/active/beta-deployment-foundation-manual-review-checklist.md`
- Deployment doc: `docs/deployment.md` (durable current-state documentation; keep after active slice files are archived)
- Environment variable template: `.env.example`

## Expected next action

Independent review found blocking documentation/slice-state issues.

1. Narrow `.env.example` and deployment docs to the exact env vars the app actually reads.
2. Do not accept the slice as review-complete until the Vercel/GitHub mapping, deployment protection, and env-scope setup are actually performed or a blocker is documented.
3. Update the execution log with real deployment-validation results once the manual setup is done.
4. Request a targeted re-review after those findings are addressed.

## Exact handoff question

Can the project be deployed to a private Vercel environment from GitHub, with `dev` available as an owner-only live test environment, `main` reserved but not publicly usable before app-level auth, exact required environment variables documented safely, and a rollback/disable-beta procedure recorded?

## Stop condition for this stage

Implementation is ready for review when:

- The Vercel/GitHub deployment mapping is configured or any blocker is documented.
- `dev` is owner-only/protected in the deployed path.
- `main`/beta-baseline is not publicly usable before app-level auth exists.
- Exact env-var usage has been discovered from the repo and documented safely in `.env.example`.
- Missing-config readiness behavior is validated and recorded.
- `npm test` and `npm run build` are run and recorded.
- Rollback/disable-beta procedures are documented and understood.
- `docs/deployment.md` is suitable to remain as the current deployment reference after the active slice files are archived.

## Constraints or notes

- This slice is deployment foundation only. It must not be treated as beta launch approval.
- The beta environment must not be exposed to testers until app-level invite-only access is implemented in a later slice.
- `main`/beta-baseline must be protected, disabled, unaliased, or otherwise not publicly usable before app-level auth exists.
- Keep `docs/deployment.md` durable/current-state; keep temporary planning, execution, and review notes in the active slice files.
- Use Vercel as the first deployment provider unless a blocking limitation is discovered.
- Use one initial Vercel project with `main` as Production and `dev` as protected Preview/dev-live deployments unless a blocker is documented.
- Use Vercel Environment Variables for deployed secrets.
- Use `.env.local` for local real values and keep it gitignored.
- Use `.env.example` for committed variable names only after discovering exact env-var usage from the repo.
- Do not introduce Azure Key Vault, Doppler, 1Password Secrets Automation, or another external secret manager for the first beta unless Vercel env vars become insufficient.
- Previously exposed or uncertain credentials have been rotated; implementation must verify that local and deployed environments use the rotated values.
- No new persistence is part of this slice.
- No feature-flow UML update is expected unless user-visible flow changes.
- Architecture docs/UML only need updates if this slice adds a real runtime boundary, such as a health endpoint, config-validation module, or deployment-platform boundary.
- Do not add a health/config endpoint unless existing readiness routes and provider logs cannot validate missing-config/dependency behavior cleanly.
