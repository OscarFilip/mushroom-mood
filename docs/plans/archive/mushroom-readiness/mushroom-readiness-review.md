# Mushroom Readiness Review

## Review scope

Planning artifacts for the mushroom-readiness feature after the feature-flow revision and the initial target-state architecture planning.

## Findings

### High severity

- None.

### Medium severity

- The detailed expert-input workflow is intentionally deferred and must remain visibly marked as unresolved in later planning artifacts.
- Confidence presentation is still open and could affect later API and UI naming.
- Human-facing docs should stay aligned with the new plain-language style as future planning files are added.

## Test coverage gaps

- No code or test changes are part of this planning-only step.

## Architecture and plan adherence

- Matches plan: the active planning files, revised feature flows, and target-state architecture all reflect the current product direction.
- Deviations from plan: none.

## Recommended follow-up

1. Build the first slice end to end under the implementation-stage handoff.
2. Resolve confidence presentation details during implementation if they block result rendering.

---

## Review round 2 — first implementation slice

- Review round: 2
- Reviewer: Claude Sonnet 4.6 (implementer self-check)
- Reviewed scope: all files created or changed in the first slice implementation session
- Review type: implementer self-check

### Files reviewed

- `lib/data/mushroomSpecies.ts`
- `lib/services/mushroomReadinessService.ts`
- `app/api/mushroom-readiness/route.ts`
- `app/features/mushroom-readiness/MushroomReadiness.tsx`
- `app/page.tsx`
- `tests/lib/services/mushroomReadinessService.test.ts`
- `tests/app/api/mushroom-readiness/route.test.ts`

## Previous findings status

- Resolved: first-slice scope confirmed and built.
- Accepted as follow-up: confidence presentation, expert-input workflow, docs alignment.

## Findings

### High severity

- None.

### Medium severity

1. **`assessWeatherSupport` has an undocumented catch-all path.** The final `return 'partial'` in `assessWeatherSupport` covers two different cases: trigger rain without sufficient moisture base, and moisture base without sufficient trigger rain. These are biologically different situations but map to the same output. The current behavior is defensible for the first slice, but the cases should be split or annotated before factor tuning in a later slice.

2. **In-season test coverage is impossible without clock mocking.** All service tests run against the real clock. In April, every species is out-of-season, so `worth-checking` and `very-likely-worth-checking` labels are never exercised. Tests for those labels will require `jest.spyOn(Date, 'now')` or dependency injection of the current date. Acceptable for the first slice, but this gap should be addressed before factor tuning is attempted.

3. **`computeConfidence` redundantly checks `hasRainData`.** The function is only called after the early return for no rain data, so `hasRainData` is always `true` inside the function body. The `if (hasRainData) score += 20` branch is always taken. Not a bug, but it is dead logic.

4. **Missing test for temperature-out-of-range causing `weatherSupport: 'missing'`.** The `assessWeatherSupport` function returns `'missing'` when temperature is known and outside the species min/max range, but no test exercises this path.

### Low severity

1. **`buildSummary`'s `label === 'unknown'` branch is unreachable in the normal code path.** `buildSummary` is only called from the normal result path, not from `buildUnknownResult`. Defensive code, but could mislead a reader into thinking `buildSummary` can be called with an unknown label.

2. **`speciesTimingSupport` duplicates `seasonalSupport` in the UI.** The factor breakdown shows both "Seasonal" and "Species timing" as separate rows, but both values are identical in this slice because `speciesTimingSupport = seasonalSupport`. Users may notice the duplication. This is documented in the execution log and is expected until SLU observation data is integrated.

3. **Client-side coordinate validation is absent.** The UI does not validate that latitude and longitude are valid numbers before submitting. Invalid input (e.g. "abc") is caught server-side and displayed in the error state, so the user does see a message. Acceptable for the first slice, but a future pass should add inline validation to avoid a round trip.

4. **`err.message` in the UI catch block is untyped.** The `catch (err)` in `checkReadiness` accesses `err.message` without a type guard. The project has `"strict": false` and this matches the pattern in `WeatherHistory.tsx`, so it is consistent. Flag for a future strict-mode or type-safety pass.

## Finding priority summary

### Blocking before merge

- None.

### Non-blocking follow-up

1. Add clock mocking to service tests so in-season labels can be covered.
2. Add a test for temperature-out-of-range triggering `weatherSupport: 'missing'`.
3. Annotate or split the `assessWeatherSupport` catch-all when factor tuning begins.
4. Remove the redundant `hasRainData` check from `computeConfidence`, or extract confidence into a function that receives only the values it needs.
5. Consider hiding the "Species timing" factor row until it carries independent data.

## Test coverage gaps

- Labels `worth-checking` and `very-likely-worth-checking` are not covered by tests (date-dependent, requires clock mocking).
- Temperature-out-of-range path in `assessWeatherSupport` is not covered.
- All four curated species are exercised in the route test; only `cantharellus-cibarius`, `boletus-edulis`, and `craterellus-tubaeformis` appear in service tests.

## Architecture and plan adherence

- Matches plan: route at `/api/mushroom-readiness`, service at `lib/services/mushroomReadinessService.ts`, feature module at `app/features/mushroom-readiness/`, species catalog at `lib/data/mushroomSpecies.ts`. All match the planned code boundaries.
- Deviations from plan: `species` object in the response includes `latinName` which is not in the plan's contract sketch. This is an additive extension that improves transparency.
- `speciesTimingSupport` is identical to `seasonalSupport` in this slice. This is a documented first-slice simplification, not an architectural deviation.
- No UML diagrams were updated. The target-state architecture diagram already captures the planned service and route boundaries, so no update was required. If the implementation had introduced new repositories or external integrations, diagrams would need updating.

## Handoff recommendation

- Recommended next owner: human or independent agent review pass
- Recommended next action: run a browser test of the main happy path, error state, and insufficient-data state before committing
- Suggested stop condition: all manual checklist items checked, or gaps explicitly accepted

## Recommended follow-up

1. Clock mocking tests for in-season label coverage.
2. Test for temperature-out-of-range weather support path.
3. Annotate the `assessWeatherSupport` catch-all before factor tuning.
4. Browser test of spot preset, species selection, loading, error, and result states.
5. SLU observation integration for `speciesTimingSupport` (separate future slice).

---

## Review round 3 - independent review pass

- Review round: 3
- Reviewer: GitHub Copilot (GPT-5.4)
- Reviewed scope: mushroom-readiness API route, service, UI, and focused tests
- Review type: independent review

### Files reviewed

- `app/api/mushroom-readiness/route.ts`
- `app/features/mushroom-readiness/MushroomReadiness.tsx`
- `lib/services/mushroomReadinessService.ts`
- `lib/utils/validation.ts`
- `tests/app/api/mushroom-readiness/route.test.ts`
- `tests/lib/services/mushroomReadinessService.test.ts`

## Previous findings status

- Still open: clock-mocking gap for in-season label coverage.
- Still open: missing temperature-out-of-range test.
- Still open: `assessWeatherSupport` catch-all ambiguity for future factor tuning.
- Still open: redundant `hasRainData` branch in `computeConfidence`.

## Findings

### High severity

- None.

### Medium severity

1. **Malformed coordinate strings are accepted as valid input.** The route parses query values with `parseFloat`, so requests like `?latitude=57abc&longitude=12.7xyz` are treated as `57` and `12.7` instead of being rejected. This breaks the API contract that latitude and longitude must be valid numbers and makes server-side validation easier to bypass accidentally from buggy clients. The current route tests only cover out-of-range numeric values, so this malformed-string case is not exercised.

### Low severity

- None beyond the previously recorded follow-up items.

## Validation run

- `get_errors` on the workspace: no errors found.
- `npx jest --testPathPatterns="mushroom" --no-coverage`: 19/19 passed.
- Parser confirmation: `node -e "console.log(parseFloat('57abc'))"` prints `57`, matching the route behavior.

## Test coverage gaps

- No route test covers malformed numeric query strings such as `57abc` or `12.7xyz`.
- Existing previously recorded coverage gaps still apply.

## Architecture and plan adherence

- The implementation still matches the planned route, service, UI, and species-catalog boundaries.
- The parser bug is a validation defect inside the planned route boundary, not an architecture drift issue.

## Handoff recommendation

- Recommended next owner: implementer
- Recommended next action: tighten query parsing in the route so only fully numeric coordinate strings are accepted, then add a route test for malformed numeric input.
- Suggested stop condition: malformed coordinate strings return `400` with a validation error and the focused mushroom test slice still passes.

---

## Review round 4 - commit readiness check

- Review round: 4
- Reviewer: GitHub Copilot (GPT-5.4)
- Reviewed scope: commit-readiness alignment for active workflow artifacts after the retry and Tailwind follow-ups
- Review type: targeted re-review

### Files reviewed

- `docs/plans/active/current-work.md`
- `docs/plans/active/mushroom-readiness-execution-log.md`
- `docs/plans/active/mushroom-readiness-manual-review-checklist.md`

## Previous findings status

- Resolved in scope: malformed numeric coordinate parsing defect.
- Resolved in scope: transient upstream fetch retry follow-up.
- Resolved in scope: Tailwind 4 styling setup defect.
- Still open as non-blocking follow-up: clock-mocking coverage gap.
- Still open as non-blocking follow-up: temperature-out-of-range service test gap.
- Still open as non-blocking follow-up: `assessWeatherSupport` catch-all ambiguity.
- Still open as non-blocking follow-up: redundant `hasRainData` branch in `computeConfidence`.

## Findings

### High severity

- None.

### Medium severity

- None.

### Low severity

- None.

## Validation run

- `npm run build`: passed.
- Manual browser verification of the main page and Tailwind-rendered UI: completed.

## Handoff recommendation

- Recommended next owner: human
- Recommended next action: make the local commit for the mushroom-readiness slice, then archive the feature files once this feature is no longer the active handoff context.
- Suggested stop condition: commit created and `docs/plans/active/current-work.md` is updated for the next active feature or archive handoff.
