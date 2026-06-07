# beta-access-control Review

## Review metadata

- Feature: `beta-access-control`
- Stage reviewed: implementation complete
- Review round: 3 — complete
- Reviewer: review-agent
- Review date: 2026-06-07

## Implementation summary

Implementation of Auth.js email magic-link sign-in with Resend email delivery, Postgres + Drizzle persistence, and whole-app beta access control is complete. See `docs/plans/active/beta-access-control-execution-log.md` for full implementation details.

### Key implementation files

- `app/auth.ts` - Auth.js configuration with Resend Email provider
- `app/api/auth/[...nextauth]/route.ts` - Auth.js route handlers
- `lib/db/schema.ts` - Drizzle schema for Auth.js + feedback tables
- `lib/db/index.ts` - Drizzle client initialization
- `lib/auth/allowlist.ts` - Email allowlist parsing and checking
- `lib/auth/guards.ts` - Page/API-level access control guards
- `app/auth/signin/page.tsx` - Sign-in UI
- `app/denied/page.tsx` - Access denied UI
- `app/components/Navbar.tsx` - User info and sign-out
- `lib/repositories/feedbackRepository.ts` - Feedback persistence layer
- `app/api/feedback/route.ts` - Feedback API endpoints

### Test coverage

- `tests/lib/auth/allowlist.test.ts` - 16 tests for email parsing/normalization/allowlist checks (PASS)
- `tests/lib/repositories/feedbackRepository.test.ts` - 6 tests for feedback repository (PASS)

### Build status

- `npm run build` - ✅ PASS (after H-1, H-2, M-1, M-2 fixes)
- `npm test` - ✅ PASS (124 tests across 12 suites — 8 new feedback route tests added)

## Review scope

When reviewing, evaluate these areas:

- ✅ Auth.js email magic-link setup with Resend.
- ✅ Postgres + Drizzle + Auth.js Drizzle adapter persistence.
- ✅ Whole-app beta gate and explicit route exceptions.
- ✅ Protected API enforcement.
- ✅ Env allowlist parsing and normalized email comparison.
- ✅ Separate beta and admin/restricted access decisions.
- ✅ Feedback persistence shape and privacy implications.
- ✅ Tests, `.env.example`, docs, diagrams, and execution log updates.

Additional review points:

- Route-level access control vs. middleware approach (route guards used for next-auth v4 compatibility)
- Session strategy choice (JWT sessions for performance)
- Error messages for denied access (generic, no leakage of allowlist/email details)
- Resend SMTP credentials security (env var only, not hardcoded)
- Database connection handling for serverless environments (postgres package used)

## Previous findings status

- Resolved: **4** (H-1 auth helper mismatch, H-2 unprotected beta APIs, M-1 missing feedback user-id, M-2 admin-policy boundary).
- Partially resolved: none.
- Accepted as follow-up: none.
- Still open: none.

## Findings

### High severity

- ~~[H-1] [app/auth.ts](app/auth.ts#L36-L40), [lib/auth/guards.ts](lib/auth/guards.ts#L8-L18), and [app/api/feedback/route.ts](app/api/feedback/route.ts#L7-L24) called `auth()` from the value exported by `NextAuth(authOptions)`, but `next-auth@4.24.14` returns the API handler from `NextAuth()`, not an `auth` helper. This caused `TypeError: iJ is not a function` at runtime and blocked the beta gate and feedback API.~~
  - **Resolved 2026-06-07**: Replaced the invalid v5-style `{ auth, signIn, signOut }` destructure with `getServerSession(authOptions)` from `next-auth` in [lib/auth/guards.ts](lib/auth/guards.ts) and [app/api/feedback/route.ts](app/api/feedback/route.ts). Removed the second `NextAuth(authOptions)` call from [app/auth.ts](app/auth.ts). `npm run build` and `npm test` (112 tests) both pass after the fix.

- [H-2] ~~[app/api/mushroom-readiness/route.ts](app/api/mushroom-readiness/route.ts#L14-L42) and [app/api/weather-history/rainy-days/route.ts](app/api/weather-history/rainy-days/route.ts#L5-L25) accepted unauthenticated requests and returned beta data directly, bypassing the beta gate.~~
  - **Resolved 2026-06-07**: Added `getServerSession(authOptions)` + `isBetaAllowed()` check at the top of both route handlers. Added 401/403 guard tests to both route test files. `npm run build` and `npm test` (116 tests) both pass.

### Medium severity

- ~~[M-1] [app/api/feedback/route.ts](app/api/feedback/route.ts#L36-L39) wrote `userId: (session.user as any).id`, but the session callback in [app/auth.ts](app/auth.ts) did not propagate the user id, so feedback records would frequently store `userId` as `undefined`.~~
  - **Resolved 2026-06-07**: Added a `session` callback in [app/auth.ts](app/auth.ts) that copies `user.id` (from the Drizzle adapter's database-backed `user` object) onto `session.user`. The feedback route cast is unchanged in form but now receives a real id when the adapter provides one.

- ~~[M-2] [app/api/feedback/route.ts](app/api/feedback/route.ts#L45-L59) is the only restricted-style API surface currently present in the slice, but it does not use the separate admin policy at all. Any authenticated user gets the same unconditional 403, and [lib/auth/allowlist.ts](lib/auth/allowlist.ts#L45-L48) `isAdmin()` is never used by a server-side boundary. That means the implementation still does not demonstrate or enforce the plan requirement that `BETA_ADMIN_EMAILS` controls restricted/admin checks separately from beta entry.~~
  - **Resolved 2026-06-08**: Wired `isAdmin()` into the feedback GET route — admins (listed in `BETA_ADMIN_EMAILS`) receive the full feedback list (200); all other authenticated users receive 403. Added a reusable `requireAdminApi()` guard to [lib/auth/guards.ts](lib/auth/guards.ts) for future admin surfaces. Added [tests/app/api/feedback/route.test.ts](tests/app/api/feedback/route.test.ts) with 8 tests covering POST 401/403/400/201 and GET 401/403/200 + the explicit assertion that a beta-only user cannot pass the admin check. `npm run build` ✅ · `npm test` ✅ (124 tests, 12 suites).

### Low severity

- None yet.

## Finding priority summary

### Blocking before merge

- None.

Manual deployed validation and environment setup have now been completed and recorded in the manual checklist and execution log.

### Recommended before merge

- Code review of auth flow and security assumptions
- Architecture alignment check with deployment setup
- Feedback persistence privacy/security check

### Follow-up after merge

- Admin UI for reviewing feedback (not in this slice)
- Rollback and disable-beta procedures (documented in deployment guide)
- Monitoring and alerting for auth/database issues

### Non-blocking follow-up

- Not applicable until implementation exists.

## Test coverage gaps to check during review

- Unit tests for allowlist parsing and email normalization.
- Policy tests for logged-out, non-invited, invited beta, and admin/restricted cases.
- Route/API tests proving direct URL/API access is protected server-side.
- Feedback persistence tests for user id, email, result context, timestamp, and optional note.
- Build/test command results recorded in the execution log.

## Architecture and plan adherence

- Matches plan: yes.
- Deviations from plan: none.

## Handoff recommendation

- Recommended next owner: human.
- Recommended next action: select the next beta-blocking slice from `beta-launch-checklist.md` and update `current-work.md` before asking an agent to continue.
- Suggested stop condition for this slice: keep the review file as the completed review record; reopen only if a new finding appears in later deployment or beta use.

## Recommended follow-up

1. Use `beta-launch-checklist.md` to choose the next beta-blocking slice.
2. Update `current-work.md` to that next slice before asking an agent to continue.
3. Reopen `beta-access-control` only if later deployment or beta use reveals a concrete defect.
