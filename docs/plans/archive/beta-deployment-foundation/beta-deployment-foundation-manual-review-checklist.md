# beta-deployment-foundation Manual Review Checklist

Use this before commit after implementation and an independent review.

## Scope and intent

- [x] The change still matches the `beta-deployment-foundation` slice.
- [x] The final diff does not implement app-level invite-only auth.
- [x] The final diff does not implement feedback persistence.
- [x] The final diff does not add unrelated product features.
- [x] Deployment foundation is not described as beta launch approval.
- [x] Any remaining open questions are documented.

## Provider and environment setup

- [x] Vercel is configured as the initial deployment provider, or a blocker and alternative are documented.
- [x] GitHub remains the source of truth for code, docs, branches, PRs, and checks.
- [x] `dev` deploys to a protected owner-only dev-live/preview environment.
- [x] `main` is reserved as the beta baseline environment.
- [x] Arbitrary visitors cannot use the protected `dev` deployment.
- [x] `main`/beta-baseline is protected, disabled, unaliased, or otherwise not publicly usable before app-level invite-only auth exists.
- [x] The beta environment is not available to testers before app-level invite-only auth exists.

## Branch and baseline strategy

- [x] `main` is protected and treated as the stable beta-baseline branch.
- [x] `dev` is treated as the working integration branch.
- [x] Optional `feature/<slice-name>` branches are documented for larger/risky work.
- [x] Promotion from `dev` to `main` happens through a PR or explicit review checkpoint.
- [x] `main` does not allow direct pushes unless the owner explicitly accepted a one-off exception.
- [x] `npm test` and `npm run build` results are recorded before promotion to `main`.
- [x] Accepted baseline commit is tagged or the tagging step is documented as pending.

## Environment variables and secrets

- [x] The implementation repo was searched for exact env-var usage before `.env.example` was finalized.
- [x] Env-var discovery method and classifications are recorded in the execution log without values.
- [x] `.env.example` exists and contains required variable names only.
- [x] `.env.example` contains no real secret values.
- [x] Local `.env.local` is ignored by Git.
- [x] Real deployed values are stored in Vercel Environment Variables.
- [x] Vercel variables are configured in the correct scopes for environments actually used.
- [x] Rotated credentials are confirmed in local and deployed environments.
- [x] `git status`, current/staged diff, `.gitignore`, env-like files, logs, screenshots, generated files, and archives were inspected for secrets.
- [x] No secret-like values appear in committed docs, plans, logs, screenshots, examples, archives, or generated files.
- [x] Secret scanner was run if already available, or manual inspection was recorded.
- [x] Any `NEXT_PUBLIC_` variable is confirmed safe for browser exposure.
- [x] No external secret manager was added unless a blocker justified it and the decision log was updated.

## External API and readiness behavior

- [x] Missing required weather/seasonal-observation API credentials do not produce normal-looking readiness results.
- [x] Missing config returns either a controlled non-2xx configuration/dependency error or an explicit degraded/unavailable result that cannot be mistaken for a successful readiness score.
- [x] External API failures produce a controlled error or degraded state.
- [x] The UI or API response makes it clear when readiness cannot be calculated.
- [x] The app does not silently fall back to misleading high-confidence output.
- [x] Any new config validation behavior has test or manual validation notes with route/action tested, expected result, actual result, and visible UI copy if applicable.
- [x] A health/config endpoint was not added unless existing readiness routes and provider logs could not validate behavior cleanly.
- [x] If a health/config endpoint was added, it exposes status only and no secret values.

## Docs and diagrams

- [x] `docs/deployment.md` explains the environment model.
- [x] `docs/deployment.md` is written as durable current-state operational documentation, not as a temporary active-slice planning file.
- [x] `docs/deployment.md` does not depend on stale `docs/plans/active/` references that will break or mislead after the slice is archived.
- [x] `docs/deployment.md` explains branch-to-environment mapping and the one-project Vercel model unless a blocker changed it.
- [x] `docs/deployment.md` explains where env vars live without exposing values.
- [x] `docs/deployment.md` explains validation steps.
- [x] `docs/deployment.md` explains rollback and disable-beta procedures.
- [x] Plan, decision log, execution log, review file, and manual checklist are present and clearly temporary/archiveable once the slice is complete.
- [x] Feature-flow diagrams were not changed unless user-visible behavior changed.
- [x] Architecture docs/UML were updated if a real config/health/deployment boundary was added.
- [x] If no UML was updated, the reason is documented in the execution log or review.

## Code quality

- [x] Any code changes are limited to deployment/config safety needs.
- [x] New abstractions are justified and not premature.
- [x] Config validation is understandable without hidden agent context.
- [x] Error handling distinguishes missing config from external API runtime failure where useful.
- [x] Naming, file placement, and structure fit the repo.

## Behavior and testing

- [x] The implementation appears to satisfy the acceptance criteria.
- [x] `npm test` was run and result recorded.
- [x] `npm run build` was run and result recorded.
- [x] Deployed `dev` environment was manually checked.
- [x] `main`/beta-baseline was checked from an unauthenticated/incognito session and confirmed not publicly usable before app-level auth.
- [x] Missing-config behavior was manually or automatically checked.
- [x] Provider build/runtime logs were inspected.
- [x] Rollback or disable-beta procedure was reviewed.

## Review and commit readiness

- [x] An independent review was completed by a different model or separate pass.
- [x] The latest review findings were triaged, not blindly applied.
- [x] Review findings were addressed or explicitly accepted as follow-up items.
- [x] Any re-review after fixes was targeted to changed or risky areas.
- [x] The owner understands the key deployment, branch, and secret-management choices well enough to explain them.
- [x] The change is ready for manual commit.

## Beta launch reminder

- [x] This slice alone does not permit inviting testers.
- [x] Next recommended slice is `beta-access-control`.
