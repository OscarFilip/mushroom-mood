# beta-access-control Decision Log

## Decision

Move `beta-access-control` from planning to implementation with the approved scope: app-level beta authentication, invite-only authorization, separate admin/restricted authorization, Auth.js/feedback persistence, and validation.

## Why

The beta launch checklist treats access control as a P0 blocker before inviting testers. Planning decisions are now settled and implementation can proceed without reopening provider, storage, or gate-scope questions.

## Alternatives considered

- Keep the slice in planning until all real secret values and validation identities are known.
- Combine all remaining beta launch checklist items into one implementation slice.
- Implement deployment-only protection and skip app-level auth.

## Tradeoffs

- Implementation can start while actual secret values remain operational setup work.
- Some beta launch checklist items remain outside this slice.
- The app gains a durable auth/data foundation earlier than a pure access-gate-only change.

## Impacted files or areas

- `docs/plans/active/current-work.md`
- `docs/plans/active/beta-access-control-plan.md`
- Auth/session setup, route guards, API guards, database schema/migrations, feedback persistence, tests, and `.env.example` during implementation.

---

## Decision

Use Auth.js as the auth provider and email magic links as the sign-in method.

## Why

Email magic links fit a small invite-only beta because users can authenticate by email without adding passwords, password resets, or external social-provider account assumptions. The authenticated email becomes the identity used by the beta and admin allowlists.

## Alternatives considered

- Custom password gate.
- Social login provider only.
- Provider-level deployment protection only.
- Public signup.

## Tradeoffs

- Magic links require email delivery and persistent verification-token storage.
- Email deliverability and sender/domain configuration become part of beta operations.
- Users have a low-friction sign-in path tied directly to invite identity.

## Impacted files or areas

- Auth.js configuration and routes.
- Sign-in/logout UI or route states.
- Database schema required by Auth.js.
- Vercel env vars and `.env.example`.
- Access-control tests.

---

## Decision

Use Resend as the email delivery provider for Auth.js magic links.

## Why

Resend is a simple fit for transactional email in a small Vercel-hosted beta and keeps magic-link delivery separate from the app host.

## Alternatives considered

- Generic SMTP.
- Postmark.
- SendGrid.
- Deferring provider choice until implementation.

## Tradeoffs

- Adds a new external dependency and required secret.
- Requires sender/from-domain setup before deployed smoke testing.
- Keeps implementation simpler than supporting multiple email providers now.

## Impacted files or areas

- Auth.js email provider configuration.
- `RESEND_API_KEY`.
- `EMAIL_FROM`.
- Deployment documentation and manual validation checklist.

---

## Decision

Use one durable Postgres database for Auth.js persistence and beta feedback persistence.

## Why

Email magic links require persistent verification tokens. Feedback tracking also needs durable storage tied to user identity and result context. A single Postgres database keeps auth, feedback, and future product data in one portable relational source of truth.

## Alternatives considered

- Minimal auth-only database now and separate product database later.
- Vercel/provider-only protection with no app database.
- KV/Redis-first storage.
- File/static-only storage.
- Supabase Postgres.

## Tradeoffs

- Adds real database infrastructure, migrations, backups, and secrets now.
- Avoids likely migration work when saved spots, settings, species/admin data, caches, and audit logs are added later.
- Keeps the future Vercel-exit path credible because the app depends on standard Postgres through `DATABASE_URL`.

## Impacted files or areas

- Drizzle schema/migrations.
- Auth.js adapter setup.
- Feedback repository/model/API.
- `.env.example` and deployed environment variables.
- Future product-data slices.

---

## Decision

Use Drizzle ORM and the Auth.js Drizzle adapter.

## Why

The app needs a real relational database soon, but the planned near-term domain does not appear large enough to justify a heavier ORM by default. Drizzle keeps the implementation close to SQL, portable, and aligned with the repo preference for small focused changes.

## Alternatives considered

- Prisma with the Auth.js Prisma adapter.
- Raw SQL only.
- Database provider SDKs or platform-specific database abstractions.

## Tradeoffs

- Drizzle is lighter and SQL-oriented.
- Prisma would provide richer ORM ergonomics if the app quickly grew into a large relational domain.
- Raw SQL would avoid ORM abstraction but would require more manual schema/query organization.

## Impacted files or areas

- `package.json` and lockfile.
- Database client/schema/migration files.
- Auth.js adapter setup.
- Feedback persistence tests.

---

## Decision

Use env-based allowlists for beta and admin authorization in the first beta.

## Why

The first beta is a small controlled cohort. Server-only env allowlists are simple, manually traceable, and sufficient before invite/admin management UI exists.

## Alternatives considered

- Database-backed invites and roles from the start.
- Provider-managed groups.
- One shared allowlist for beta and admin access.
- Public signup.

## Tradeoffs

- Changing testers/admins requires env var updates and redeploy/runtime refresh depending on platform behavior.
- There is no self-service invite management yet.
- The authorization logic remains simple and auditable for the first beta.

## Impacted files or areas

- `BETA_ALLOWED_EMAILS`.
- `BETA_ADMIN_EMAILS`.
- Env parsing/access-policy helpers.
- Access-control tests.
- Manual deployed-environment validation.

---

## Decision

Normalize allowlist emails by lowercasing and trimming before comparison.

## Why

Email case and accidental whitespace should not cause false denials or inconsistent behavior between beta/admin checks.

## Alternatives considered

- Exact string comparison.
- Normalize only the session email.
- Normalize only env var entries.

## Tradeoffs

- Normalization adds a small helper that must be tested.
- It avoids common operational mistakes when editing comma-separated allowlists.

## Impacted files or areas

- Access-policy helpers.
- Unit tests.
- `.env.example` documentation.

---

## Decision

Keep beta access and admin/restricted access separate.

## Why

An invited tester should be able to use the main beta app without automatically gaining restricted/admin access. Admin access should be explicit, separately configured, and separately testable.

## Alternatives considered

- Make every invited tester an admin.
- Use one allowlist for all protected surfaces.
- Defer admin checks because current restricted/admin species-management surfaces are not implemented.

## Tradeoffs

- Requires two policies and two env vars.
- Requires tests or manual checks for admin/restricted decisions even when no admin UI exists yet.
- Prevents future restricted species-management work from accidentally inheriting beta-user access.

## Impacted files or areas

- Beta access policy.
- Admin/restricted access policy.
- Future restricted/admin routes and APIs.
- Manual smoke-test checklist.

---

## Decision

Gate the whole app by default except auth routes, logout/callback routes, denied/forbidden pages, static assets, and required framework/auth internals.

## Why

The app is not meant to be publicly usable before beta. A whole-app gate is the simplest safe default: direct URLs and unknown pages are protected unless explicitly exempted.

## Alternatives considered

- Public landing page plus protected app.
- Public UI shell with gated data/actions.
- API-only/server-action gate.
- Restricted/admin-only gate.
- Provider-level deployment protection only.

## Tradeoffs

- Safer and easier to reason about for the first beta.
- No public marketing/waitlist page is available in this slice.
- Implementation must avoid redirect loops and avoid guarding auth/static/framework internals.

## Impacted files or areas

- Middleware/route guards.
- Auth route exceptions.
- Denied/forbidden pages.
- Protected API checks.
- Feature-flow and architecture diagrams.

---

## Decision

Use safe denied copy for non-invited authenticated users.

## Why

Non-invited users should understand why access is blocked without exposing allowlists, secret names with values, provider configuration, or internal implementation details.

## Alternatives considered

- Generic error page.
- Detailed access diagnostic page.
- Redirect all failures back to sign-in.

## Tradeoffs

- Clear copy improves manual validation and user understanding.
- It must not leak whether other emails are invited or show operational details.

## Impacted files or areas

- Denied page/state.
- Tests or snapshots if UI tests are added.
- Manual review checklist.

Approved copy or equivalent:

> This beta is invite-only. You are signed in as X, but this email is not currently on the beta access list.

---

## Decision

Store feedback with user id, email, result context, timestamp, and optional note together.

## Why

Beta feedback needs to be useful for investigating whether readiness results are understandable and accurate. Keeping user identity and result snapshot together makes feedback review possible without relying on raw logs only.

## Alternatives considered

- Store feedback in provider logs only.
- Store only free-text notes.
- Delay feedback persistence to a later slice.
- Build a full feedback-review admin UI now.

## Tradeoffs

- Adds a small amount of product-data persistence to an access-control slice.
- Avoids a separate storage redesign when feedback capture is implemented.
- Feedback review UI remains out of scope.

## Impacted files or areas

- Feedback schema/model/repository/API.
- Privacy/data documentation.
- Tests.
- Beta launch checklist feedback tasks.

---

## Decision

Use JWT sessions for the beta gate by default while keeping database persistence for users, verification tokens, and feedback.

## Why

JWT sessions can keep the whole-app gate simple by allowing access decisions from session identity plus env allowlists. The database is still required for email magic-link verification tokens and durable feedback.

## Alternatives considered

- Database sessions from the start.
- Custom stateless token handling.
- Re-check database membership for every request.

## Tradeoffs

- JWT sessions are simple for the first beta gate.
- Database sessions may become attractive later if immediate server-side session revocation or richer account lifecycle features are required.
- Access to beta/admin remains controlled by env allowlists, not by session content alone.

## Impacted files or areas

- Auth.js configuration.
- Middleware/session reads.
- Access-policy tests.

---

## Decision

Do not create a new admin/species-management surface in this slice.

## Why

The current repo is understood to have no implemented restricted/admin species-management route, component, or API. The current supported species source is the static curated catalog. Admin species-management remains planned future work.

## Alternatives considered

- Build a placeholder admin route only to exercise admin authorization.
- Move the species catalog into the database now.
- Ignore admin authorization entirely until the future admin feature starts.

## Tradeoffs

- Keeps this slice focused.
- Admin policy still needs to exist or be clearly documented so future restricted surfaces have a defined boundary.
- Full admin route validation may be limited until a real restricted surface exists.

## Impacted files or areas

- Access-policy helpers/tests.
- Target architecture docs.
- Future species-management plan.

---

## Decision

Treat manual validation identities and deployed secret setup as required manual work for this slice to count as done.

## Why

The implementation cannot commit real tester emails, admin emails, database URLs, Auth.js secrets, or Resend secrets. Deployed smoke testing still requires those values to be configured manually.

## Alternatives considered

- Commit test identities or secrets.
- Skip deployed manual validation.
- Count local-only validation as beta-ready.

## Tradeoffs

- Completion requires an explicit manual operational step.
- Keeps secrets and personal/tester data out of the repo.
- Makes the final beta-readiness gate more realistic.

## Impacted files or areas

- Manual review checklist.
- Execution log.
- Vercel environment variables.
- `.env.local` owned by the developer.
