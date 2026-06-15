# Beta Launch Checklist

Use this checklist as the **master beta release gate** for Mushroom Mood.

The goal is not to finish the full product. The goal is to safely invite a small group of trusted testers and learn whether the readiness result is understandable, useful, and operationally stable.

The beta is allowed to be narrow, but it must be:

- **Controlled** — only intended testers can access it.
- **Explainable** — users can understand why a readiness result was shown.
- **Observable** — failures and feedback are visible to you.
- **Reversible** — you can pause, disable, or roll back the beta if needed.

## How to use this checklist

This checklist tracks the whole beta launch. It should not be treated as one single feature.

Use `current-work.md` for the **one focused beta-blocking work slice currently being planned, implemented, or reviewed**.

When one slice is finished, return to this checklist, update the relevant checkboxes, and choose the next beta-blocking slice.

## Beta scope

This beta is testing:

- whether the readiness result feels useful
- whether the explanation is understandable
- whether confidence and limitations are clear
- whether feedback helps identify scoring, UX, and explanation issues
- whether the app behaves reliably in a production-like environment

This beta is not testing, unless explicitly added later:

- public signup
- saved spots
- large-scale usage
- automatic feedback-based recalibration
- advanced admin tooling
- final scoring perfection

## Status legend

- `[ ]` Not started
- `[~]` In progress or partially implemented
- `[x]` Done
- `[?]` Needs product decision

## P0 — Required before inviting beta testers

### 1. Deployment foundation, configuration, and secrets

The goal is to create a private environment where the rest of the beta work can be tested realistically. It should not make the app publicly usable before access control is ready.

| Status | Task | Done means |
| --- | --- | --- |
| `[x]` | Choose the beta deployment target | You know whether the first beta will run in staging, production, or a separate private beta environment. |
| `[x]` | Deploy the current app to a private beta-like environment | The app deploys successfully, but `dev` and any pre-auth `main`/beta-baseline deployment are not publicly usable by arbitrary users. |
| `[x]` | Configure required environment variables | Required config is discovered from the repo, documented without values, and present in the correct deployed environment scopes. |
| `[x]` | Configure external API credentials | Weather and observation/seasonal evidence credentials work in the deployed environment or fail safely. |
| `[x]` | Verify startup and runtime behavior | Build-time, startup, and runtime errors are visible and diagnosable. |
| `[x]` | Verify production build | `npm run build` passes locally and in the deployment path. |
| `[x]` | Verify test command | `npm test` passes before using the deployment as the beta baseline. |
| `[x]` | Rotate any exposed or uncertain credentials | Any secrets that may have appeared in local archives, logs, screenshots, or shared files are replaced before beta. |
| `[x]` | Document rollback or disable-beta procedure | `docs/deployment.md` remains the durable deployment reference and explains how to redeploy the previous stable version, disable beta access, or take the beta environment offline. |
| `[x]` | Confirm deployment is a foundation, not a launch | The team agrees that deployment alone does not permit inviting testers. |

### 2. Access control and beta-only entry

Status note, 2026-06-15: the `beta-access-control` slice is complete for its approved scope. Auth.js email magic-link sign-in, invite-only access, separate admin/restricted policy, automated deploy-time migrations, and feedback persistence foundation are implemented and manually validated in the deployed environment. Remaining beta work moves to explanation clarity, broader feedback UX, monitoring, and launch readiness rather than reopening this slice.

| Status | Task | Done means |
| --- | --- | --- |
| `[x]` | Add login/sign-in | A tester can authenticate reliably in the deployed beta-like environment. |
| `[x]` | Add invite-only access | Non-invited users cannot reach the beta app, even if they know the URL. |
| `[x]` | Add role checks for restricted screens | Beta users cannot access restricted/admin-only routes, APIs, or species-management flows. |
| `[x]` | Add access-control tests | Tests cover invited user access, non-invited user rejection, unauthenticated rejection, and restricted/admin route blocking. |
| `[x]` | Manually test access boundaries | Login, logout, blocked access, invited access, and restricted-screen protection have been manually verified. |
| `[x]` | Re-check access control in the deployed environment | Access rules work outside local development. |

### 3. Readiness result clarity

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Show the readiness result clearly | The user can see the readiness label, probability/score, confidence, selected spot, selected species, and timestamp/context of the result. |
| `[ ]` | Show the main inputs behind the result | The UI exposes the key weather, seasonal, and species-rule inputs that influenced the score. |
| `[ ]` | Show weather evidence | The user can see the relevant precipitation, temperature, and weather-history signals used by the readiness calculation. |
| `[ ]` | Show seasonal evidence | The user can see whether seasonality came from observation-backed evidence, sparse evidence, missing evidence, stale cache, widened radius/lookback, or static calendar fallback. |
| `[ ]` | Show species-state explanation | The user can understand how the selected species profile affected the readiness result. |
| `[ ]` | Explain fallback behavior | If evidence is missing, weak, stale, or unavailable, the UI says so plainly and does not present the result as more certain than it is. |
| `[ ]` | Avoid biological overclaiming | The UI makes it clear that the score is a readiness signal, not a guarantee that mushrooms are present or safe to eat. |
| `[ ]` | Validate explanation clarity in the deployed environment | A tester-like user can understand the result without reading developer docs. |

### 4. Feedback capture

Status note, 2026-06-15: feedback persistence foundation is implemented as part of `beta-access-control`, but a user-visible feedback submission and review experience is still future beta work. Keep the user-facing feedback items below scoped to that later slice.

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Add simple result feedback | Testers can mark a result as `helpful`, `wrong`, or `unclear`. |
| `[ ]` | Allow optional written feedback | Testers can add a short note when the result seems wrong or unclear. |
| `[~]` | Store feedback with result context | Backend persistence foundation exists and stores the approved context shape, but the broader user-facing feedback flow is not fully exposed yet. |
| `[ ]` | Make feedback reviewable | You can find, read, and group submitted feedback without digging through raw logs only. |
| `[x]` | Decide recalibration policy | For beta, feedback is collected for review only and does not automatically change scoring unless explicitly decided otherwise. Decision recorded in `beta-access-control` plan: no automatic recalibration in this slice. |
| `[ ]` | Verify feedback in the deployed environment | Feedback submitted in the deployed beta-like environment is persisted and reviewable. |

### 5. External dependency resilience

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Handle SMHI/weather failures | Weather API failure returns a controlled error or fallback state, not a crash or misleading score. |
| `[ ]` | Handle observation/seasonal evidence failures | Observation API failure uses stale processed evidence when allowed, or falls back to static calendar with a visible limitation. |
| `[ ]` | Surface limitation states in the UI | Important limitations such as unavailable seasonal evidence, sparse evidence, expanded radius, expanded lookback, and stale cache are visible or translated into user-friendly copy. |
| `[ ]` | Define beta pause criteria for dependency failures | You know when to pause invites or warn testers if external APIs are unreliable. |
| `[ ]` | Test degraded states | At least one test or manual scenario proves that missing/sparse/unavailable evidence is understandable to the user. |
| `[ ]` | Verify degraded states in the deployed environment | Failure/fallback behavior works outside local development. |

### 6. Monitoring and operations

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Add useful server-side logging | Auth failures, readiness API failures, external API failures, feedback submissions, and unexpected errors are logged. |
| `[ ]` | Add alerts or a daily review routine | You either receive alerts for serious failures or commit to checking logs/feedback at a defined cadence during beta. |
| `[ ]` | Assign operational ownership | One person is responsible for reviewing issues, feedback, and errors during the beta. |
| `[ ]` | Define response expectations | You know how quickly you will react to access problems, broken results, external dependency failures, and confusing feedback. |
| `[ ]` | Verify logs from the deployed environment | You can see useful logs from the same environment testers will use. |

### 7. Privacy, disclaimer, and onboarding

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Review stored user/tester data | You know what user identity, location/spot, feedback, and result context are stored. |
| `[ ]` | Minimize stored sensitive data | You only store what is needed for beta learning and debugging. |
| `[ ]` | Add a short beta privacy note | Testers can understand what data is collected, why, and how to contact you about it. |
| `[ ]` | Add a short disclaimer | Testers understand that Mushroom Mood is an experimental readiness tool and not safety, edibility, or foraging advice. |
| `[ ]` | Add a short first-run beta guide | Testers understand what the readiness score means, what confidence means, what limitations mean, and how to give feedback. |
| `[ ]` | Confirm privacy/disclaimer text appears before or during beta use | Testers do not need external explanation from you to understand the limits of the beta. |

### 8. Testing and release validation

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Keep existing automated test bar green | `npm test` passes. |
| `[ ]` | Verify production build before each beta release | `npm run build` passes. |
| `[ ]` | Add integration coverage for new backend flows | Each new backend flow has a happy-path test, invalid-input test, and failure/empty-result test where applicable. |
| `[ ]` | Run manual beta smoke test | The smoke test below passes in the environment testers will use. |
| `[ ]` | Update docs and diagrams where behavior changed | Feature-flow and architecture docs match the implemented beta behavior. |
| `[ ]` | Do a final launch-gate review | You have checked every item in the beta launch gate before inviting testers. |

### 9. First tester cohort and invite plan

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Define the first tester cohort | You have a short list of named trusted testers. |
| `[x]` | Define how testers will get access | Testers will sign in with Auth.js email magic links through Resend and must be listed in `BETA_ALLOWED_EMAILS`; admin/restricted access is separately controlled by `BETA_ADMIN_EMAILS`. |
| `[ ]` | Define what kind of feedback you want | Testers know whether to focus on usefulness, explanation clarity, obvious wrongness, bugs, or confusing limitations. |
| `[ ]` | Prepare the tester message | You have a short message explaining what the beta is, what it is not, how to use it, and how to report problems. |
| `[ ]` | Invite only the first small cohort | You start with a small controlled group, not a broad public release. |

## P1 — Strongly recommended before beta, but not launch-blocking if consciously deferred

| Status | Task | Done means |
| --- | --- | --- |
| `[ ]` | Add feedback tags/categories | Feedback can be grouped by issue type, such as weather felt wrong, season felt wrong, explanation unclear, or app bug. |
| `[ ]` | Add admin/reviewer view for feedback | You can review feedback in-app instead of only through a database or logs. |
| `[ ]` | Add basic analytics counters | You can count beta users, readiness checks, feedback submissions, failed checks, and fallback frequency. |
| `[ ]` | Add clearer copy for sparse evidence | Sparse, stale, and fallback explanations are written in user-friendly language, not only technical limitation codes. |
| `[ ]` | Add a known-limitations page | Testers can read what the app currently does not handle well. |
| `[ ]` | Add a lightweight post-beta review template | You have a simple place to summarize what the first cohort revealed. |

## P2 — Explicitly postpone unless needed for the first cohort

| Status | Task | Why postpone |
| --- | --- | --- |
| `[ ]` | Public signup | Beta should stay invite-only. |
| `[ ]` | Saved spots | Useful later, but not required to test readiness clarity. |
| `[ ]` | Automatic feedback-based recalibration | Risky during beta; review feedback manually first. |
| `[ ]` | Advanced species-management UI | Restricted catalog maintenance can stay manual unless adding species becomes a beta need. |
| `[ ]` | Persistent derived seasonal-evidence cache | Important long-term, but an in-memory cache can be acceptable for a very small single-instance beta if fallback behavior is clear. |
| `[ ]` | Full end-to-end test suite | Useful later; unit and integration tests plus manual smoke testing are enough for the first controlled beta. |
| `[ ]` | Final factor tuning | Beta feedback should inform this; do not pretend the score is final before testers react to it. |

## Manual beta smoke test

Run this in staging or the production-like beta environment before inviting testers.

| Status | Scenario | Expected result |
| --- | --- | --- |
| `[ ]` | Visit deployed beta URL before access control is ready | App is private, blocked, protected by platform-level access, or otherwise not publicly usable. |
| `[ ]` | Deploy current build | Deployment succeeds with correct environment variables. |
| `[ ]` | Confirm required secrets/config are present | App can start and call required services, or fail safely with clear errors. |
| `[ ]` | Visit app while logged out | User is asked to sign in or is blocked from beta content. |
| `[ ]` | Sign in as non-invited user | User cannot reach the beta app. |
| `[ ]` | Sign in as invited beta user | User can reach the main beta flow. |
| `[ ]` | Sign in as beta user and try restricted/admin route | User is blocked. |
| `[ ]` | Select or enter a spot and choose a supported mushroom species | App returns a readiness result. |
| `[ ]` | Open the explanation/evidence view | User can see weather, seasonal, species, confidence, and limitation information. |
| `[ ]` | Trigger or simulate sparse/missing seasonal evidence | App shows a lower-confidence or fallback explanation instead of overclaiming. |
| `[ ]` | Trigger or simulate external API failure | App degrades gracefully, shows a controlled message/limitation, and logs the issue. |
| `[ ]` | Submit `helpful` feedback | Feedback is stored and reviewable. |
| `[ ]` | Submit `wrong` or `unclear` feedback with a note | Feedback is stored with result context and explanation snapshot. |
| `[ ]` | Check deployed logs | Auth failures, readiness failures, external API failures, feedback submissions, and unexpected errors are visible. |
| `[ ]` | Run rollback or disable-beta procedure in a safe test | You know how to recover if a bad release goes out. |

## Beta launch gate

Do not invite testers until all of these are true:

- `[ ]` A private staging or production-like beta environment exists.
- `[ ]` The deployed environment has required config and valid rotated secrets.
- `[ ]` The app can be disabled, protected, or rolled back quickly if needed.
- `[ ]` Only invited testers can access the beta app.
- `[ ]` Beta users cannot access restricted/admin-only functionality.
- `[ ]` Readiness results show score/probability, confidence, species, spot/context, and the main evidence behind the result.
- `[ ]` Missing, sparse, stale, widened, or fallback evidence is visible and understandable.
- `[ ]` The UI does not imply that the app guarantees mushroom presence, edibility, or safety.
- `[ ]` Feedback can be submitted, stored with result context, and reviewed.
- `[ ]` External API failures do not crash the app or silently produce misleading results.
- `[ ]` Useful logs or review routines exist for beta operations.
- `[ ]` Required secrets/config are present, valid, and not exposed.
- `[ ]` `npm test` and `npm run build` pass.
- `[ ]` Manual smoke test passes in the deployed beta-like environment.
- `[ ]` A short beta privacy note, disclaimer, and first-run guide are available to testers.
- `[ ]` The first tester cohort and invite message are ready.

## Beta success criteria

The first beta cohort is successful if:

- trusted testers can complete the main readiness flow without help
- testers understand why a result was given, even when they disagree with it
- feedback identifies concrete issues or confirms that the explanation is useful
- no unauthorized users gain access
- no restricted/admin-only functionality is exposed to beta users
- external dependency failures are visible, controlled, and recoverable
- you end the beta with a clearer list of scoring, explanation, and UX improvements

## Pause or rollback criteria

Pause new invites, disable the beta, or roll back the release if any of these happen:

- the deployed environment is publicly usable before invite-only access is ready
- a non-invited user can access the beta app
- a beta user can access restricted/admin-only functionality
- secrets, tester data, location/spot data, or feedback data are exposed
- readiness results are shown without enough explanation to understand major limitations
- external API failures cause crashes, blank pages, or misleading high-confidence results
- feedback capture is broken and you cannot learn from tester sessions
- the app cannot be deployed, disabled, or rolled back reliably