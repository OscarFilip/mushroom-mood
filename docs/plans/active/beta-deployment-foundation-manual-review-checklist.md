# beta-deployment-foundation Manual Review Checklist

Use this before commit after implementation and an independent review.

## Scope and intent

- [ ] The change still matches the `beta-deployment-foundation` slice.
- [ ] The final diff does not implement app-level invite-only auth.
- [ ] The final diff does not implement feedback persistence.
- [ ] The final diff does not add unrelated product features.
- [ ] Deployment foundation is not described as beta launch approval.
- [ ] Any remaining open questions are documented.

## Provider and environment setup

- [ ] Vercel is configured as the initial deployment provider, or a blocker and alternative are documented.
- [ ] GitHub remains the source of truth for code, docs, branches, PRs, and checks.
- [ ] `dev` deploys to a protected owner-only dev-live/preview environment.
- [ ] `main` is reserved as the beta baseline environment.
- [ ] Arbitrary visitors cannot use the protected `dev` deployment.
- [ ] The beta environment is not available to testers before app-level invite-only auth exists.

## Branch and baseline strategy

- [ ] `main` is protected and treated as the stable beta-baseline branch.
- [ ] `dev` is treated as the working integration branch.
- [ ] Optional `feature/<slice-name>` branches are documented for larger/risky work.
- [ ] Promotion from `dev` to `main` happens through a PR or explicit review checkpoint.
- [ ] Accepted baseline commit is tagged or the tagging step is documented as pending.

## Environment variables and secrets

- [ ] `.env.example` exists and contains required variable names only.
- [ ] `.env.example` contains no real secret values.
- [ ] Local `.env.local` is ignored by Git.
- [ ] Real deployed values are stored in Vercel Environment Variables.
- [ ] Rotated credentials are confirmed in local and deployed environments.
- [ ] No secret-like values appear in committed docs, plans, logs, screenshots, examples, or generated files.
- [ ] Any `NEXT_PUBLIC_` variable is confirmed safe for browser exposure.
- [ ] No external secret manager was added unless a blocker justified it and the decision log was updated.

## External API and readiness behavior

- [ ] Missing required weather/seasonal-observation API credentials do not produce normal-looking readiness results.
- [ ] External API failures produce a controlled error or degraded state.
- [ ] The UI or API response makes it clear when readiness cannot be calculated.
- [ ] The app does not silently fall back to misleading high-confidence output.
- [ ] Any new config validation behavior has test or manual validation notes.

## Docs and diagrams

- [ ] `docs/deployment.md` explains the environment model.
- [ ] `docs/deployment.md` explains branch-to-environment mapping.
- [ ] `docs/deployment.md` explains where env vars live without exposing values.
- [ ] `docs/deployment.md` explains validation steps.
- [ ] `docs/deployment.md` explains rollback and disable-beta procedures.
- [ ] Plan, decision log, execution log, review file, and manual checklist are present.
- [ ] Feature-flow diagrams were not changed unless user-visible behavior changed.
- [ ] Architecture docs/UML were updated if a real config/health/deployment boundary was added.
- [ ] If no UML was updated, the reason is documented in the execution log or review.

## Code quality

- [ ] Any code changes are limited to deployment/config safety needs.
- [ ] New abstractions are justified and not premature.
- [ ] Config validation is understandable without hidden agent context.
- [ ] Error handling distinguishes missing config from external API runtime failure where useful.
- [ ] Naming, file placement, and structure fit the repo.

## Behavior and testing

- [ ] The implementation appears to satisfy the acceptance criteria.
- [ ] `npm test` was run and result recorded.
- [ ] `npm run build` was run and result recorded.
- [ ] Deployed `dev` environment was manually checked.
- [ ] Missing-config behavior was manually or automatically checked.
- [ ] Provider build/runtime logs were inspected.
- [ ] Rollback or disable-beta procedure was reviewed.

## Review and commit readiness

- [ ] An independent review was completed by a different model or separate pass.
- [ ] The latest review findings were triaged, not blindly applied.
- [ ] Review findings were addressed or explicitly accepted as follow-up items.
- [ ] Any re-review after fixes was targeted to changed or risky areas.
- [ ] The owner understands the key deployment, branch, and secret-management choices well enough to explain them.
- [ ] The change is ready for manual commit.

## Beta launch reminder

- [ ] This slice alone does not permit inviting testers.
- [ ] Next recommended slice is `beta-access-control`.
