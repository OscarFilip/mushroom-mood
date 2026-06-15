# readiness-result-clarity Manual Review Checklist

Use this before commit after implementation and an independent review.

## Scope and intent

- [x] The change implements only beta launch checklist section `3. Readiness result clarity`.
- [x] The final diff still matches the planned slice boundary.
- [x] No feedback, onboarding, monitoring, privacy, saved-spots, access-control, or species-management work was added accidentally.
- [x] Any remaining open questions are documented in the execution log or review file.

## Main result card

- [x] The result shows the readiness label.
- [x] The result shows `Readiness score` as `N/100` or `—` when unknown.
- [x] The result shows `Confidence` as `{High|Medium|Low} · N/100`.
- [x] Readiness score and confidence are visually and textually distinct.
- [x] The selected species display name and Latin name are visible.
- [x] The selected spot is visible.
- [x] The checked timestamp/context is visible.
- [x] Unknown/degraded results still show useful context instead of a dead end.

## Explanation details

- [x] `Weather signals` shows relevant precipitation evidence.
- [x] `Weather signals` shows relevant temperature evidence when available.
- [x] `Weather signals` shows weather-history coverage when available.
- [x] `Seasonal evidence` explains observation-backed, sparse, missing, stale, unavailable, widened radius/lookback, or species-calendar fallback states where applicable.
- [x] `Species fit` explains how the selected species profile affects the result without implying identification or safety advice.
- [x] Raw seasonal counts and model internals are not shown in the main result UI.

## Fallbacks, limitations, and overclaiming

- [x] Raw limitation codes are not shown to users.
- [x] Limitation copy is plain-language and deliberate.
- [x] Sparse, missing, stale, unavailable, expanded radius, and expanded lookback states do not look equally certain as observation-backed results.
- [x] Every result includes: `This is a readiness signal based on weather and season patterns. It does not guarantee mushrooms are present, and it is not identification or safety advice.`
- [x] Summary text does not overclaim that mushrooms are present or safe.

## Docs and diagrams

- [x] Plan, decision log, execution log, review file, and manual checklist are present.
- [x] Feature-flow diagrams were updated if user-visible behavior changed enough to make the current diagram inaccurate.
- [x] Architecture diagrams were updated if response shape or responsibilities changed enough to make the current diagram inaccurate.
- [x] Generated SVG files were not edited by hand.

## Code quality

- [x] A UI-facing mapper/view model is used, or any decision not to use one is explained in the execution log.
- [x] User-facing copy is not scattered across unrelated service/repository code.
- [x] New response fields have a single clear source of truth.
- [x] No new dependencies were introduced without a decision-log entry.
- [x] Naming, file placement, and structure fit the repo.

## Behavior and testing

- [x] Mapper/unit tests cover readiness score formatting.
- [x] Mapper/unit tests cover confidence labels and confidence score formatting.
- [x] Mapper/unit tests cover limitation copy.
- [x] Mapper/unit tests cover seasonal evidence source/fallback copy.
- [x] Mapper/unit tests cover unknown/degraded results and disclaimer presence.
- [x] Service tests cover `checkedAt`, weather evidence, and seasonal source if response-shape fields were added.
- [x] Route tests were updated if response-shape assertions changed.
- [x] `npm test` was run and the result was recorded.
- [x] `npm run build` was run and the result was recorded.

## Deployed/manual validation

- [x] A normal readiness result is understandable without developer docs.
- [x] A sparse or missing seasonal-evidence result is understandable without developer docs.
- [x] A species-calendar fallback result is understandable without developer docs.
- [x] The tester can tell why the result happened.
- [x] The UI does not imply guaranteed mushrooms, identification, edibility, or safety advice.
- [x] Screenshots or notes are recorded in the execution log if available.

## Review and commit readiness

- [x] An independent review was completed by a different model or separate review pass.
- [x] The latest review findings were triaged, not blindly applied.
- [x] Review findings were addressed or explicitly accepted as follow-up items.
- [x] Any re-review after fixes was targeted to changed or previously risky areas.
- [x] The change is ready for a manual commit.


## Independent review status — 2026-06-15

- [x] Independent review was completed by a separate review pass (`independent-review-1`).
- [x] Blocking finding fixed: no-rain/unknown results preserve `seasonalEvidence.source: 'observation-backed'` when seasonal observation evidence is sufficient.
- [x] Targeted service test added for no-rain + sufficient seasonal evidence => observation-backed source.
- [x] Medium finding triaged/fixed: changing species clears stale result context.
- [x] Medium finding triaged/fixed: editing manual latitude/longitude clears stale result context.
- [x] Medium finding triaged/fixed or explicitly accepted as follow-up: `rainHistoryDays` wording/semantics do not overstate sparse or stale weather coverage.
- [x] Targeted re-review completed after the above fixes or documented follow-up decisions.


## Targeted re-review follow-up status — 2026-06-15

- [x] Documentation-only targeted re-review of the review fixes was completed (`targeted-rereview-2`).
- [x] Medium follow-up fixed or explicitly accepted: an in-flight readiness request cannot restore an old result after species, preset spot, latitude, or longitude changes before the request resolves.
- [x] Test coverage follow-up fixed or explicitly accepted: rainfall-history wording has a direct mapper regression test preventing a return to `days of rainfall data` / `days available` copy.
- [x] Review, execution, current-work, manual checklist, and beta checklist docs capture the latest findings and next action.
- [x] `npm test -- --passWithNoTests` was rerun after any targeted implementation/test updates.
- [x] `npm run build` was rerun after any targeted implementation/test updates.
- [x] Deployed/manual validation was completed for a normal result and a degraded/fallback result.
