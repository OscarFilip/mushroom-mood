# beta-access-control Manual Review Checklist

Use this before commit after implementation and independent review.

## Scope and intent

- [x] The change still matches the `beta-access-control` scope.
- [x] No public signup, self-service invite management, saved spots, advanced admin tooling, feedback-review UI, automatic recalibration, or unrelated refactor work was introduced.
- [x] Auth.js, Resend, Postgres, Drizzle, and Auth.js Drizzle adapter choices are recorded in the decision log.
- [x] Any implementation deviations from the approved plan are recorded in the execution log.

## Docs and diagrams

- [x] `docs/uml/feature/current/beta-access-control.puml` matches implemented user behavior.
- [x] `docs/uml/architecture/target/beta-access-control.puml` matches implemented access-control and admin-policy boundaries or has been updated if implementation materially differs.
- [x] `docs/uml/architecture/target/beta-feedback.puml` matches implemented feedback persistence boundaries or has been updated if implementation materially differs.
- [x] `docs/feature-flows.md` and `docs/architecture.md` reference the relevant access-control diagrams.
- [x] `docs/deployment.md` reflects any deployment, environment variable, rollback, or disable-beta behavior changed by implementation.
- [x] `docs/done-and-testing.md` remains accurate for the implemented access-control test strategy.
- [x] Plan, decision log, execution log, and review file are present and current.

## Code quality

- [x] Access decisions are centralized enough to avoid divergent page/API behavior.
- [x] UI link hiding is not the only protection.
- [x] Protected APIs enforce auth and authorization server-side.
- [x] Restricted/admin checks are separate from normal invited-beta access.
- [x] Email allowlists are parsed as comma-separated values and normalized with lowercase + trim before comparison.
- [x] Sign-in, logout, callback, denied, forbidden, static, and framework/internal routes do not create redirect loops.
- [x] Denied states do not expose allowlists, secret values, provider secrets, database URLs, or internal stack traces.
- [x] The implementation does not create a new admin/species-management UI unless that was explicitly approved after this plan.

## Persistence and data

- [x] Auth.js persistence uses Postgres through Drizzle/Auth.js Drizzle adapter.
- [x] Database migrations/schema are committed and repeatable.
- [x] Feedback persistence stores user id, email, result context, timestamp, and optional note.
- [x] Feedback context includes enough readiness/result snapshot data to investigate beta feedback later.
- [x] No real tester data, secret values, database URLs, or API keys are committed.
- [x] Future data tables such as saved spots, settings, species admin, caches, and audit logs were not added unless implementation required and documented them.

## Behavior and testing

- [x] Logged-out visitor cannot reach protected beta pages.
- [x] Logged-out request cannot call protected beta APIs successfully.
- [x] Authenticated but non-invited user cannot reach beta content.
- [x] Invited beta user can reach the main beta flow.
- [x] Invited beta user who is not admin cannot pass restricted/admin checks.
- [x] Admin/restricted user can pass intentionally included admin/restricted checks.
- [x] Direct URL access is protected.
- [x] Logout clears access and returns to a signed-out or blocked state.
- [x] If a user-facing feedback submission surface is exposed in this slice, it stores the approved fields when a signed-in beta user submits feedback.
- [x] `npm test` passes.
- [x] `npm run build` passes.

## Manual operational setup required before this slice counts as beta-ready

These are manual because real values and identities must not be committed.

- [x] Configure `DATABASE_URL` in local development and the relevant Vercel Preview/Production scopes.
- [x] Configure `AUTH_SECRET`.
- [x] Configure deployed host/Auth.js URL or trust-host settings as required by the implemented Auth.js version and hosting environment.
- [x] Configure `RESEND_API_KEY`.
- [x] Configure `EMAIL_FROM` and any required Resend sender/domain verification.
- [x] Configure `BETA_ALLOWED_EMAILS` with at least one invited beta tester email.
- [x] Configure `BETA_ADMIN_EMAILS` with at least one admin/restricted email.
- [x] Configure at least one signed-in non-invited identity for negative testing.
- [x] Verify an allowed beta user can sign in by magic link and access the app in the deployed environment.
- [x] Verify a signed-in non-allowed user is denied with the invite-only message in the deployed environment.
- [x] Verify a signed-in beta user who is not admin cannot pass restricted/admin checks.
- [x] Verify a signed-in admin/restricted user passes admin/restricted checks where such checks exist.
- [x] If a deployed user-facing feedback submission surface is exposed, verify it persists user id, email, result context, timestamp, and optional note.
- [x] Record manual validation results in the execution log or release checklist without recording secret values.

## Environment and operations

- [x] `.env.example` contains only variable names/placeholders, no real values.
- [x] Vercel Preview variables are configured for dev-live validation.
- [x] Vercel Production variables are configured before accepting `main` as beta baseline.
- [x] Provider-level deployment protection fallback is still understood.
- [x] Disable-beta and rollback procedures still apply after app-level auth is added.

## Review and commit readiness

- [x] An independent review was completed by a different model or separate pass.
- [x] Blocking review findings were resolved or explicitly accepted as follow-up by the owner.
- [x] Any re-review after fixes was targeted to changed or previously risky areas.
- [x] The change is ready for a manual commit.
