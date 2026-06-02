# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`observation-backed-seasonality`


## Stage

`implementation`

Allowed values:

- `planning`
- `implementation`
- `review`

## Current owner

`planning-agent`

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

## Primary files

- Plan: `docs/plans/active/observation-backed-seasonality-plan.md`
- Decision log: `docs/plans/active/observation-backed-seasonality-decision-log.md`
- Execution log: `docs/plans/active/observation-backed-seasonality-execution-log.md`
- Review: `docs/plans/active/observation-backed-seasonality-review.md`
- Manual checklist: `docs/plans/active/observation-backed-seasonality-manual-review-checklist.md`

## Expected next action

The seasonal repository contract, degraded fallback behavior, freshness direction, target architecture wording, and testing strategy are now aligned: return processed seasonal evidence, expose the UI-visible fields under `explanation.seasonalEvidence`, remove `speciesTimingSupport`, use a `24 hour` TTL with `7 day` stale-if-error reuse, treat persistent derived-evidence cache as the long-run target, keep external fetch logic out of the readiness service, mock the seasonal repository in service tests, keep repository integration tests separate, and inject time where seasonal or freshness behavior depends on the current date. The next planning continuation should declare the slice ready for implementation planning unless additional scoring or source-validation work is intentionally added.

Do not leave this blank if you want minimal-prompt continuation.

## Exact handoff question

Is the observation-backed seasonality planning slice now narrow and stable enough to move into implementation, or is there one last scoring or source-validation decision that should be made first?

## Stop condition for this stage

The target architecture and seasonal policy drafts agree on the same repository boundary, taxon-ID strategy, fallback order, scoring shape, evidence sufficiency thresholds, freshness model, degraded fallback behavior, testing strategy, time-control boundary, and UI-visible readiness response shape.

## Constraints or notes

- Keep the current `/api/mushroom-readiness` route as the main readiness entry point unless planning proves a separate observation route is necessary.
- Keep the expert-input workflow deferred; do not let species-management or admin workflow scope expand this slice.
- Preserve the current target-architecture boundary where a `Seasonal Observation Repository` supplies observation evidence to the readiness service.
- Planning must keep the freshness and fallback decisions aligned with the policy draft: cached processed seasonal evidence, persistent cache as the long-run target, stale-cache reuse inside the fallback window, and static-calendar fallback when observation evidence is sparse, missing, or unavailable without reusable stale cache.
- Planning must keep testing aligned with the clean repository boundary: no direct external fetch logic in the readiness service, mocked repository in service tests, separate repository integration tests, and injected time for seasonal or TTL-sensitive behavior.
- `speciesTimingSupport` should be removed once observation-backed seasonality replaces the static calendar path because it does not represent an independent signal.