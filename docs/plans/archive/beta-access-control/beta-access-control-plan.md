# beta-access-control Implementation Plan

## Summary

Add app-level beta access control for Mushroom Mood so only authenticated invited testers can use the deployed beta app. Use Auth.js email magic links through Resend, env-based allowlists for beta/admin authorization, and one Postgres database through Drizzle for Auth.js persistence and beta feedback records.

This slice prepares the app for a controlled beta. It does not launch the beta by itself.

## Slice boundary

- This slice includes:
  - Auth.js setup for email magic-link sign-in.
  - Resend as the email delivery provider for magic links.
  - One durable Postgres database used by Auth.js persistence and feedback persistence.
  - Drizzle ORM and the Auth.js Drizzle adapter.
  - A whole-app beta gate for user-facing app routes and protected APIs.
  - Explicit exceptions for auth routes, logout/callback routes, denied/forbidden pages, static assets, and required framework/auth internals.
  - Invite-only beta authorization through `BETA_ALLOWED_EMAILS`.
  - Separate restricted/admin authorization through `BETA_ADMIN_EMAILS`.
  - Normalized email comparisons: lowercase and trimmed before allowlist checks.
  - Feedback persistence capable of storing user id, email, result context, timestamp, and optional note.
  - Tests or documented manual validation for logged-out, non-invited, invited beta, and admin/restricted cases.
  - `.env.example`, docs, diagrams, decision log, execution log, review file, and manual checklist updates.
- This slice does not include:
  - Public signup.
  - Self-service invite management.
  - Database-backed invite or role management UI.
  - Saved spots.
  - Account-management settings beyond what Auth.js requires.
  - Public marketing or waitlist pages.
  - Advanced admin tooling.
  - New species-management editing surfaces.
  - Feedback review UI.
  - Automatic feedback-based recalibration.
  - Broad readiness scoring, weather, species, or UX refactors.
  - Replacing provider-level deployment protection as the emergency fallback.
- Review this slice against:
  - `docs/plans/active/beta-launch-checklist.md`, especially access control and feedback capture prerequisites.
  - `docs/deployment.md`, especially provider-level protection, environment variable handling, rollback, and disable-beta guidance.
  - `docs/done-and-testing.md` for minimum test expectations.
  - `docs/uml/feature/current/beta-access-control.puml`, `docs/uml/architecture/target/beta-access-control.puml`, and `docs/uml/architecture/target/beta-feedback.puml`.

## Goal

A tester can sign in by email magic link and use the main beta app only when their normalized email is listed in `BETA_ALLOWED_EMAILS`. A logged-out visitor and an authenticated non-invited user cannot reach beta content or protected beta APIs even with direct URLs. Admin/restricted checks remain separate and are controlled by `BETA_ADMIN_EMAILS`.

Feedback submitted during the beta can be persisted with enough identity and result context to investigate tester reports later.

## Scope

- In scope:
  - Authentication and session setup required for a small trusted beta cohort.
  - Server-side access-control helpers, middleware/guards, and API enforcement.
  - Email allowlist parsing and normalization helpers.
  - Denied/forbidden states with safe, non-secret-revealing copy.
  - Auth.js and feedback database schema/migrations.
  - A minimal feedback model/repository/API path if needed to persist the decided beta feedback shape.
  - Tests for auth/access policy and the most important protected route/API behavior.
- Out of scope:
  - Database-managed invites or roles.
  - Admin route/component/species-management UI creation when no such surface exists yet.
  - Feedback triage/reviewer UI.
  - Public user onboarding beyond access-denied/sign-in copy.

## Context

- The current deployed app is a Next.js Mushroom Mood app with a spot-check flow. Deployment runs on Vercel, with `main` reserved as the future beta baseline and `dev` used for owner-only preview testing.
- The beta launch checklist treats access control as a P0 requirement before inviting testers.
- Planning decisions for this slice are now approved and recorded in `docs/plans/active/beta-access-control-decision-log.md`.
- The current repo is understood to have no implemented restricted/admin species-management route, screen, or API. Supported species are currently represented by a static curated catalog in code. Restricted/admin species-management remains future work.
- The implementation should still provide a separate admin policy/guard so future restricted surfaces do not reuse the beta-tester allowlist by accident.

## Approved decisions

- Auth provider: Auth.js.
- Sign-in method: email magic link.
- Email delivery: Resend.
- Access model: invite-only allowlist by normalized email.
- Beta source of truth: `BETA_ALLOWED_EMAILS` env var.
- Admin/restricted source of truth: `BETA_ADMIN_EMAILS` env var.
- Beta tester status does not imply admin/restricted status.
- Gate scope: whole app except auth/logout/callback/denied/forbidden/static/framework internals.
- Database: one durable Postgres database.
- ORM: Drizzle.
- Auth adapter: Auth.js Drizzle adapter.
- Feedback tracking: store user id, email, result context, timestamp, and optional note together.
- Session strategy default: JWT sessions for the beta gate, while the database remains required for users, verification tokens, and feedback.
- Manual validation identities and secret values are operational setup work, not committed code.

## Data and environment design

### Environment variables

Implementation must update `.env.example` with placeholder names only. Expected variables:

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="replace-me"
AUTH_URL="https://example.com"
AUTH_TRUST_HOST="true"
RESEND_API_KEY="replace-me"
EMAIL_FROM="Mushroom Mood <beta@example.com>"
BETA_ALLOWED_EMAILS="person1@example.com,person2@example.com"
BETA_ADMIN_EMAILS="admin@example.com"
```

Notes:

- Real values belong in `.env.local` and Vercel Environment Variables only.
- `AUTH_URL`/host settings should match the Auth.js version and deployed host behavior used during implementation.
- `AUTH_TRUST_HOST` should only be used where needed for the deployed/proxy environment.
- `BETA_ALLOWED_EMAILS` and `BETA_ADMIN_EMAILS` are comma-separated, server-only env vars.
- Emails must be lowercased and trimmed before comparison.

### Initial persistence shape

The initial database should support Auth.js required tables plus a small feedback table/model.

Suggested feedback fields:

```text
feedback
- id
- userId
- email
- resultContext json/jsonb
- note nullable text
- createdAt
```

`resultContext` should store a snapshot sufficient to investigate the submitted result later without requiring a full saved-spots feature. It should include, when available, selected species, selected spot/area, readiness result, probability/score, confidence, explanation/limitation snapshot, and relevant timestamps.

Future product data such as saved spots, user settings, database-managed species/admin data, caches, and audit logs should use the same Postgres database when those feature slices begin. Do not implement those future tables in this slice unless required by the access-control implementation.

## User-facing behavior

- Logged-out users who request protected app content are redirected to sign in or receive a controlled unauthorized response for APIs.
- Signed-in users whose normalized email is not in `BETA_ALLOWED_EMAILS` see this denied copy or equivalent:

  > This beta is invite-only. You are signed in as X, but this email is not currently on the beta access list.

- Invited beta users can use the normal main app flow.
- Beta users who are not admins cannot pass admin/restricted checks.
- Admin/restricted checks use `BETA_ADMIN_EMAILS` and are separate from beta access.
- Denied/forbidden states must not reveal secret values, full allowlists, internal stack traces, provider secrets, or database configuration.

## Acceptance criteria

- Auth.js email magic-link sign-in is configured with Resend.
- A valid invited beta user can sign in and reach the main beta app.
- Logged-out visitors cannot reach protected beta pages.
- Logged-out requests cannot successfully call protected beta APIs.
- Signed-in non-invited users cannot reach protected beta pages or protected beta APIs.
- Direct URL access is protected the same way as UI navigation.
- Invite checks use `BETA_ALLOWED_EMAILS` with lowercase/trimmed comparison.
- Restricted/admin checks use `BETA_ADMIN_EMAILS` and do not grant admin access merely because someone is an invited beta user.
- If restricted/admin routes, APIs, or species-management surfaces exist at implementation time, they are protected server-side. If none exist, the admin policy/guard is implemented or documented as the required boundary for future restricted surfaces without inventing new admin UI.
- Auth.js persistence uses Postgres through Drizzle/Auth.js Drizzle adapter.
- Feedback records can persist user id, email, result context, timestamp, and optional note.
- `.env.example` contains variable names/placeholders only and no real secrets.
- Access-control tests cover unauthenticated, non-invited, invited beta, and admin/restricted policy cases.
- `npm test` and `npm run build` pass, or failures are recorded in the execution log with cause and next action.
- Manual deployed-environment validation steps are documented and marked as required before this slice counts as beta-ready.

## Handoff readiness for implementation

- Code paths expected to change:
  - Auth.js configuration/routes.
  - Middleware or route/page guard code.
  - Shared access-policy helpers.
  - API route authorization wrappers/checks.
  - Drizzle schema/migrations and database access setup.
  - Feedback model/repository/API path as needed.
  - Environment variable template.
  - Tests.
  - Docs and UML source.
- Required tests or checks before review handoff:
  - Unit tests for allowlist parsing/normalization and access-policy decisions.
  - Integration tests for at least one protected page/route behavior and one protected API behavior where feasible.
  - Feedback persistence test or repository/API test where feedback writing is implemented.
  - `npm test`.
  - `npm run build`.
- Known risks to call out to the reviewer:
  - Redirect loops around sign-in/callback/logout/denied routes.
  - Accidentally guarding Auth.js callback/static/framework internals.
  - Client-only UI hiding being mistaken for server-side authorization.
  - Differences between local, Vercel Preview, and Vercel Production env vars.
  - Postgres/Resend/Auth.js secrets missing in deployed scopes.

## Proposed approach

### User flow impact

The main user-facing change is that beta visitors encounter a sign-in gate before the app. Email magic-link sign-in identifies the user. The server checks whether the user's normalized email is invited. Non-invited users receive a denied state; invited users continue to the app. Admin/restricted checks are separate and only pass for emails listed in `BETA_ADMIN_EMAILS`.

### Architecture impact

Add a runtime boundary in front of protected pages and APIs:

- Browser/app routes.
- Auth.js sign-in/callback/session handling.
- Resend for magic-link email delivery.
- Access guard/middleware.
- Beta access policy backed by `BETA_ALLOWED_EMAILS`.
- Admin policy backed by `BETA_ADMIN_EMAILS`.
- Drizzle/Postgres persistence for Auth.js and feedback records.

The current static curated species catalog remains the runtime source for supported species. Database-backed species editing is future work.

### Testing approach

Prefer fast, focused tests:

- Pure unit tests for email normalization and allowlist parsing.
- Policy tests for logged-out, non-invited, invited beta, and admin cases.
- Route/API integration tests for protected behavior.
- Feedback persistence test for the decided record shape.
- Manual deployed-environment smoke testing after secrets and validation identities are configured.

### Review strategy

- Implementer self-check required before independent review: yes.
- Independent reviewer or model: separate review pass after implementation.
- Re-review scope after fixes: changed files plus previously flagged access-control/database areas.
- Stop condition for review-fix loop: no unresolved blocking findings, tests/build passing or accepted documented exceptions.

## Implementation steps

1. Add Auth.js, Resend email provider/configuration, Drizzle, Auth.js Drizzle adapter, and Postgres connection setup.
2. Add Drizzle schema/migrations for Auth.js required persistence and feedback records.
3. Add server-only env parsing helpers for `BETA_ALLOWED_EMAILS` and `BETA_ADMIN_EMAILS` with lowercase/trim normalization.
4. Add beta and admin access-policy helpers.
5. Add whole-app gate/middleware/page/API enforcement, with explicit exceptions for auth/logout/callback/denied/forbidden/static/framework internals.
6. Add denied/forbidden pages or states with safe copy.
7. Add minimal feedback persistence path using the approved feedback data shape.
8. Update `.env.example`, durable docs, UML source files, execution log, and manual review checklist.
9. Add/update tests for policy, protected pages/APIs, and feedback persistence.
10. Run `npm test` and `npm run build`; record results in the execution log.
11. Hand off to independent review.

## Risks

- Auth callback or static assets could be accidentally gated, causing sign-in loops or broken rendering.
- A protected API could be missed if only page navigation is guarded.
- Email comparison bugs could reject valid testers or allow unintended identities.
- Missing Vercel Preview/Production env vars could make local tests pass while deployed beta fails.
- Database migrations or connection handling could add deployment fragility.
- Feedback context could be under-specified if the implementation does not capture the result snapshot at submission time.
- Storing location/spot and feedback data increases privacy/documentation responsibility.

## Open questions

None blocking implementation. Planning decisions are approved.

Operational values still required during implementation/deployment and must not be committed:

- Actual `DATABASE_URL`.
- Actual `AUTH_SECRET`.
- Actual Resend API key and sender/domain configuration.
- Actual beta tester/admin email addresses.
- Actual deployed host/Auth.js URL settings.

## Exit criteria for review handoff

- Implementation matches the planned slice boundary.
- Required tests or checks for this slice have been run.
- Known deviations, shortcuts, setup gaps, and risks are written down in the execution log.
- Manual validation steps that require real identities or deployed secrets are documented as incomplete until performed.

## Exit criteria for commit readiness

- Blocking review findings are resolved or explicitly accepted by the owner.
- The latest diff still matches the planned slice.
- `npm test` and `npm run build` pass or owner-accepted exceptions are recorded.
- Manual deployed-environment checks are complete or explicitly documented as the remaining release-gate work.

## Definition of done

- Auth.js email magic-link sign-in works with Resend.
- Postgres + Drizzle persistence supports Auth.js and feedback records.
- Whole-app beta gate and protected API checks are implemented server-side.
- Beta/admin allowlists work as approved.
- Feedback records store the approved identity/context fields.
- Tests cover the changed access-control and persistence behavior.
- Relevant docs and diagrams are updated.
- Manual validation accounts and deployed env var setup are recorded as required beta-readiness work.
- Review has been completed.
