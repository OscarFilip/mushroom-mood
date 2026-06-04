# Observation-Backed Seasonality Execution Log

## Planned work session

- Goal: create the missing active planning artifacts and capture the current architecture and policy decisions for observation-backed seasonality
- Starting point: `docs/plans/active/current-work.md` points to planning files that do not exist yet
- Plan file: `docs/plans/active/observation-backed-seasonality-plan.md`
- Active model or agent: GitHub Copilot GPT-5.4
- Current stage: planning

## Review findings being addressed

- Source review file and round: none yet
- Findings in scope for this session: none
- Findings intentionally deferred: testing and time-control strategy, plus any additional live API experiments that require local secret availability

## Changes made

- Created the active implementation plan for the observation-backed seasonality slice.
- Created the active decision log with settled architecture and policy defaults plus explicit open scoring direction.
- Created placeholder execution and review artifacts so the active plan set exists.
- Created a manual review checklist file for later implementation and review phases.
- Replaced the seasonal policy placeholders with a concrete runtime-policy draft and machine-readable config.
- Refined the target architecture diagram so runtime observation search and admin-only taxon search are explicit separate concerns.
- Ran a live ArtDatabanken radius probe against the Ullared preset for `Boletus edulis` and used the result to settle the first fallback order.
- Added deterministic evidence sufficiency thresholds so the future seasonal observation repository can return `missing`, `sparse`, or `sufficient` consistently.
- Settled the minimum seasonal repository contract and removed `speciesTimingSupport` from the planned future readiness response shape.
- Expanded the planned seasonal repository and readiness response contract to include the UI-visible evidence fields that now have a concrete consumer.
- Aligned the plan and policy docs to state that the repository returns processed seasonal evidence rather than raw observation records.
- Settled freshness policy on cached processed evidence with a `24 hour` TTL plus a `7 day` stale-if-error reuse window.
- Chose a persistent derived-evidence cache as the long-run architectural target, while allowing an in-memory cache only as an initial implementation shortcut.
- Defined degraded behavior so readiness falls back to the existing static species calendar when observation evidence is missing, remains sparse, or is temporarily unavailable.
- Tightened the target architecture diagram and architecture page wording so the derived-evidence cache, stale-cache reuse, and static-calendar fallback are visible before implementation starts.
- Settled the testing strategy: mock the seasonal repository in readiness-service tests, keep repository integration tests separate, and inject time where seasonal or freshness behavior depends on the current date.

## Commands and checks run

```text
Read planning templates and active planning context.
Verified that the referenced observation-backed-seasonality planning files did not exist before this session.
POST https://api.artdatabanken.se/species-observation-system/v1/Observations/Search for taxonId 245630 around Ullared at 3 km, 5 km, 10 km, and 15 km.
Observed totals: 3 km -> 0, 5 km -> 2, 10 km -> 6, 15 km -> 20.
Observed last-10-year counts: 5 km -> 1, 10 km -> 4, 15 km -> 16.
```

## Post-fix validation

- Narrow validation run after changes: reread the touched planning sections in the active plan, decision log, seasonal policy, and current-work handoff
- Result: completed; the planning artifacts now agree on repository contract direction, freshness policy, cache persistence target, degraded fallback behavior, and testing/time-control strategy
- If not run, why not: n/a

## Failures or blockers

- The planning files referenced by `current-work.md` were missing.
- Real observation API experiments are blocked until a local environment variable is set in the terminal with the external API key.

## Resolutions

- Added the missing active planning artifacts.
- Captured the pending API experiment as a follow-up step instead of leaving it implicit.

## Files intentionally changed

- `docs/uml/architecture-mushroom-mood-target.puml`
- `docs/architecture.md`
- `docs/plans/active/observation-backed-seasonality-plan.md`
- `docs/plans/active/observation-backed-seasonality-decision-log.md`
- `docs/plans/active/observation-backed-seasonality-execution-log.md`
- `docs/plans/active/observation-backed-seasonality-review.md`
- `docs/plans/active/observation-backed-seasonality-manual-review-checklist.md`

## Handoff note for next reviewer or implementer

- Next owner: planning-agent or human
- What to inspect first: plan freshness section, degraded-behavior wording, and the updated decision log entries
- Remaining uncertainty or risk: final seasonality scoring tuning and additional live validation across more species and locations

## Remaining risks or follow-up items

- Validate the sufficiency thresholds against more species and locations before treating them as stable beyond the first slice.
- Carry the settled freshness and fallback decisions into implementation without widening the slice.
- Keep the testing strategy aligned with the clean repository boundary during implementation.
- Keep raw records and deeper evidence breakdowns out of scope until a concrete consumer needs them end to end.