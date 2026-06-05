# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`beta-deployment-foundation`

## Stage

`planning`

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

`not-started`

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
- Deployment doc: `docs/deployment.md`
- Environment variable template: `.env.example`

## Expected next action

Finalize the `beta-deployment-foundation` planning decisions, then implement the private Vercel-based deployment foundation.

The next implementation pass should:

1. Configure the Vercel project and connect it to GitHub.
2. Map `dev` to a protected owner-only dev-live/preview environment.
3. Map `main` to the future beta baseline environment.
4. Add or update `.env.example` with required variable names only.
5. Add or update `docs/deployment.md` with environment, secrets, validation, rollback, and disable-beta procedures.
6. Verify that missing critical external API credentials do not produce normal-looking readiness results.
7. Run `npm test` and `npm run build` before accepting the deployment baseline.

## Exact handoff question

Can the project be deployed to a private Vercel environment from GitHub, with `dev` available as an owner-only live test environment, `main` reserved as the beta baseline, required environment variables documented safely, and a rollback/disable-beta procedure recorded?

## Stop condition for this stage

Planning is complete when:

- The provider/environment/branch/secrets decisions are recorded in the decision log.
- The implementation plan has clear acceptance criteria and implementation steps.
- `docs/deployment.md` and `.env.example` are ready to be created or updated during implementation.
- The next implementer can start without asking what deployment target, branch strategy, or secret-management approach to use.

## Constraints or notes

- This slice is deployment foundation only. It must not be treated as beta launch approval.
- The beta environment must not be exposed to testers until app-level invite-only access is implemented in a later slice.
- Use Vercel as the first deployment provider unless a blocking limitation is discovered.
- Use Vercel Environment Variables for deployed secrets.
- Use `.env.local` for local real values and keep it gitignored.
- Use `.env.example` for committed variable names only.
- Do not introduce Azure Key Vault, Doppler, 1Password Secrets Automation, or another external secret manager for the first beta unless Vercel env vars become insufficient.
- Previously exposed or uncertain credentials have been rotated; implementation must verify that local and deployed environments use the rotated values.
- No new persistence is part of this slice.
- No feature-flow UML update is expected unless user-visible flow changes.
- Architecture docs/UML only need updates if this slice adds a real runtime boundary, such as a health endpoint, config-validation module, or deployment-platform boundary.
