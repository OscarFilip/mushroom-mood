# readiness-result-clarity Review

## Review scope

Review of the `readiness-result-clarity` implementation against:

- `docs/plans/active/readiness-result-clarity-plan.md`
- `docs/plans/active/readiness-result-clarity-decision-log.md`
- `docs/plans/active/beta-launch-checklist.md`, section `3. Readiness result clarity`
- `docs/done-and-testing.md`

- Review rounds: `self-check-1`, `independent-review-1`, `targeted-rereview-1`, `targeted-rereview-2`
- Reviewer model or agent: `implementation-agent` (self-check), `review-agent` (independent review and targeted re-review), external static review follow-up
- Reviewed diff, commit, or file scope:
  - `lib/services/mushroomReadinessService.ts`
  - `lib/viewModels/readinessResultViewModel.ts` (new)
  - `app/features/mushroom-mood/MushroomMood.tsx`
  - `tests/lib/services/mushroomReadinessService.test.ts`
  - `tests/lib/viewModels/readinessResultViewModel.test.ts` (new)
  - `tests/app/api/mushroom-readiness/route.test.ts`
- Review type: implementer self-check, independent review, targeted re-review, and documentation-only re-review follow-up

## Previous findings status

- Resolved: independent-review-1 blocking seasonal-source issue; independent-review-1 immediate visible stale-result issue; independent-review-1 rainfall wording issue; stale workflow documentation status after this documentation-only pass.
- Partially resolved: stale-result handling is only partially resolved because visible results clear on input edits, but in-flight responses can still restore old results after those edits.
- Accepted as follow-up: self-check non-blocking items around `explanation.summary` disposition and future copy/locale/station-name choices.
- Still open: targeted-rereview-2 medium stale in-flight response finding; targeted-rereview-2 rainfall wording regression-test gap; automated test/build rerun after any targeted implementation updates; manual deployed validation.

## Self-check findings (`self-check-1`)

### High severity

- None found.

### Medium severity

- **Summary copy may still overclaim in some branches**: `buildSummary` in the service produces phrases such as `Worth checking your spot` and `Fruiting is possible but not guaranteed.` These are from the existing service and were not changed in this slice (in scope only to add `checkedAt`, `weatherEvidence`, `source`). The new MushroomMood.tsx no longer renders `result.explanation.summary` directly in the main card, so this is a reduced risk. However, the `explanation.summary` field is still returned in the API and used nowhere in the new UI. The reviewer should confirm this is acceptable, or decide whether `summary` should be moved to the details section or removed from the public view model.
  - Recommended disposition: **accept as non-blocking follow-up** — the summary is not shown in the beta UI and does not risk overclaiming to the user in this slice.

### Low severity

- **`isUnknown` field is produced but not used in the new component**: `ResultCard` renders the same layout for all result types, including unknown. The old component had an `isInsufficient` branch with different content. The new layout works for unknown results too (limitation banner surfaces the reason, disclaimer is always shown), but the `isUnknown` property is unused in the component. This is fine — the view model provides it as an optional consumer hint.
  - Recommended disposition: **accepted — no change needed**.

- **`checkedAt` formatting uses `en-SE` locale**: If the app is used from a non-Swedish browser, the date may still render in `en-SE` format due to the hardcoded locale. The plan did not specify locale format requirements for this slice.
  - Recommended disposition: **accepted — locale choice is a future UX decision, not blocking**.

- **Weather station names appear in `weatherEvidence` but are not shown in the UI**: The station names are returned by the API and mapped into the view model's `weatherSignals` section as raw fields in the `WeatherEvidence` type, but the UI currently does not display them. They are available for future use.
  - Recommended disposition: **accepted — the plan mentioned station names as optional details, not required**.

## Self-check finding priority summary

### Blocking before merge

- None.

### Non-blocking follow-up

- `explanation.summary` is computed and returned but not displayed in the beta UI. Decide in a future slice whether to expose it, adapt it, or remove it from the view model.
- Review overclaiming risk in `buildSummary` copy during a future summary/copy improvement slice.

## Self-check test coverage notes

- No meaningful gaps found.
- 32 new tests added covering: mapper labels, score/confidence formatting, limitation copy, seasonal evidence source copy, weather evidence copy, unknown/degraded results, disclaimer presence, species fit, and all new service fields.
- All 176 tests pass, build is clean.
- Manual deployed validation remains pending.

## Self-check architecture and plan adherence

- Matches plan: Yes.
  - `lib/viewModels/readinessResultViewModel.ts` created as recommended.
  - `ReadinessResult` extended with `checkedAt`, `weatherEvidence`, and `seasonalEvidence.source` as specified.
  - `MushroomMood.tsx` rewritten with main-card plus three details sections as planned.
  - Raw limitation codes are gone from the UI.
  - Raw seasonal counts are not shown in the main result UI.
  - Disclaimer present for every result including unknown.
  - Confidence is label-first (`Medium · 43/100`), not percentage-first.
  - Readiness score is `N/100`, not `%`.
- Deviations from plan: None material. `explanation.summary` is still computed and returned but not shown in the UI (the plan did not require it to be shown or hidden).

## Self-check handoff recommendation

- Recommended next owner: `review-agent`
- Recommended next action: perform independent review of the implementation against the plan, decision log, and beta checklist section 3.
- Suggested stop condition for this round: no blocking findings remain; non-blocking follow-ups are explicitly accepted or documented.

## Recommended follow-up

1. Independent reviewer (`review-agent`) should review the diff listed above.
2. Manual deployed validation for normal result and degraded/fallback result is pending.
3. `explanation.summary` disposition (expose or remove) can be addressed in a future copy slice.


---

## Independent review — 2026-06-15 (`independent-review-1`)

### Verdict

**Not merge-ready yet.** The implementation direction matches the approved architecture and the UI-facing mapper is a good boundary, but the independent review found one blocking degraded-state correctness issue and two medium clarity risks.

### Blocking before merge

#### 1. Unknown/no-rain results can report the wrong seasonal evidence source

- **Severity:** High / blocking.
- **Files involved:** `lib/services/mushroomReadinessService.ts`, especially the no-rain early return in `getMushroomReadiness` and `buildUnknownResult`.
- **Problem:** The no-rain path exits through `buildUnknownResult(...)`. `buildUnknownResult` always builds seasonal evidence with source `species-calendar`. If weather/rain data is unavailable but seasonal observation evidence was actually sufficient, the API can return contradictory evidence such as `quality: 'sufficient'` with `source: 'species-calendar'`.
- **User impact:** The mapper/UI may tell testers that local observations were limited and the app used the species calendar, even when observation-backed seasonal evidence was available. This weakens the fallback/degraded-state clarity requirement.
- **Recommended fix:** Compute the seasonal source before the early return, or pass an evidence source into `buildUnknownResult`. For example, use `observation-backed` when `seasonalObsResult.evidenceQuality === 'sufficient'` and `seasonalObsResult.seasonalityScore !== null`; otherwise use `species-calendar`.
- **Required test:** Add a service test for: no rain data + sufficient seasonal repository evidence => `seasonalEvidence.source === 'observation-backed'`.

### Medium severity

#### 2. Changing species or manual coordinates leaves the old result visible

- **Severity:** Medium.
- **File involved:** `app/features/mushroom-mood/MushroomMood.tsx`.
- **Problem:** Preset spot buttons clear the result, but species changes and manual latitude/longitude edits do not. A tester can run a result, then change species or coordinates and still see the old result card.
- **User impact:** The result card does include its own result context, but the visible controls can point to a different species or location than the displayed result. This undermines the selected spot/species/context clarity goal.
- **Recommended fix:** Clear `result` and `error` in species, latitude, and longitude change handlers. A small `clearResultContext()` helper would avoid duplicating state resets.
- **Recommended tests:** Add UI/component tests if the project has an existing pattern for `MushroomMood`; otherwise document manual validation steps in this checklist.

#### 3. `rainHistoryDays` can overstate evidence coverage

- **Severity:** Medium.
- **Files involved:** `lib/services/mushroomReadinessService.ts`, `lib/viewModels/readinessResultViewModel.ts`.
- **Problem:** `computeRainWindows` uses `dated.length` as `rainHistoryDays`. That is a measurement count, not necessarily continuous recent coverage or distinct days in the 30-day window. The mapper currently turns it into user-facing copy: `{N} days of rainfall data used`.
- **User impact:** Sparse or stale weather measurements can sound more complete than they are.
- **Recommended fix:** Either calculate distinct measurement dates within the intended recent window, or make the UI copy more conservative, such as `rainfall measurements available`, until coverage semantics are stronger.
- **Recommended test:** Add a service or mapper test that covers sparse/stale rainfall inputs if `rainHistoryDays` remains user-facing as “days”.

### Positive review notes

- `lib/viewModels/readinessResultViewModel.ts` is the right boundary for UI copy and limitation translation.
- Readiness score and confidence are visually and textually separated as planned.
- Raw seasonal counts are kept out of the main UI.
- Limitation codes are translated into deliberate copy.
- The no-guarantee disclaimer is present for normal and unknown/degraded results.
- The service response additions are narrow and aligned with the plan.

### Independent-review test status

- Static review only. The uploaded archive does not include the project-level `package.json`, Jest config, or full toolchain files, so the independent reviewer could not rerun `npm test` or `npm run build` from the archive.
- The earlier implementation execution log records `npm test -- --passWithNoTests` and `npm run build` as passing before this independent review.

### Handoff recommendation after independent review

- Recommended next owner: `implementation-agent`.
- Recommended next action: fix blocking finding 1 and medium finding 2 before merge; either fix finding 3 in this slice or explicitly document it as a follow-up if rainfall coverage semantics are outside the current slice.
- Recommended re-review: targeted re-review of `lib/services/mushroomReadinessService.ts`, `lib/viewModels/readinessResultViewModel.ts`, `app/features/mushroom-mood/MushroomMood.tsx`, and related tests after fixes.

---

## Targeted re-review — 2026-06-15 (`targeted-rereview-1`)

### Fixes applied

**Blocking finding 1 (fixed):** `buildUnknownResult` in `lib/services/mushroomReadinessService.ts` now derives `evidenceSource` from `seasonalObsResult` before building the seasonal evidence summary. Source is `'observation-backed'` when quality is `'sufficient'` and `seasonalityScore` is non-null; otherwise `'species-calendar'`. Two new service tests cover the no-rain + sufficient case and the no-rain + sparse case.

**Medium finding 2 (fixed):** `app/features/mushroom-mood/MushroomMood.tsx` now calls `clearResultContext()` (a small helper resetting `result` and `error`) from the species button `onClick`, latitude `onChange`, and longitude `onChange` handlers. Old result is cleared immediately when inputs change.

**Medium finding 3 (fixed in this slice):** `lib/viewModels/readinessResultViewModel.ts` now uses `rainfall measurements available` in both branches of the `weatherHistory` copy instead of `days of rainfall data used` / `days available`. The wording no longer implies continuous-day coverage.

### Post-fix test and build status

- `npm test -- --passWithNoTests`: 178 passed, 0 failed.
- `npm run build`: compiled successfully, all type checks pass.

### Re-review verdict

All three independent-review-1 findings are resolved. No new issues introduced by the targeted fixes. This slice meets the stop condition defined in `current-work.md` and is merge-ready pending manual deployed validation.

### Remaining open items

- Manual deployed validation for a normal result and a degraded/fallback result is still pending; this was not gated on by this review round.
- `explanation.summary` disposition (expose or remove from public API) is a deferred follow-up from self-check-1.

---

## Targeted re-review follow-up — 2026-06-15 (`targeted-rereview-2`)

### Scope and constraint

This pass reviewed the review fixes that were present in the uploaded repository snapshot. It was a static re-review only: no tests or build were run, and no code or test implementation changes were made in this pass by handoff instruction.

### Verdict

**Not merge-ready yet.** The original independent-review-1 blocking issue and immediate stale-result issue appear addressed, and the rainfall copy itself is more conservative. However, one medium stale-async behavior gap remains, and one targeted copy-regression test is missing.

### Medium severity

#### 4. In-flight readiness responses can restore a stale result after inputs change

- **Severity:** Medium.
- **File involved:** `app/features/mushroom-mood/MushroomMood.tsx`.
- **Problem:** The first stale-result fix clears `result` and `error` when species, latitude, or longitude changes. However, `checkReadiness()` still applies the response from the submitted request unconditionally when it resolves. A user can start a readiness check, change species or coordinates while the request is loading, and then have the old request call `setResult(...)` after the controls already show the new context.
- **User impact:** The result card can again represent a different species/location than the visible controls. That undermines the selected spot/species/context clarity goal and is the async version of the stale-result issue found in independent-review-1.
- **Recommended fix:** Capture a submitted-input request key/snapshot for latitude, longitude, and species, invalidate it when inputs change, and only call `setResult` / `setError` / `setLoading(false)` for the still-current request. An `AbortController` or disabling all inputs while loading would also reduce the risk, but a request-key guard is the safer minimum.
- **Recommended validation:** Add component-level coverage if the project has a pattern for this component; otherwise document manual validation for: start check, change species while loading, confirm the old result does not reappear after the request resolves. Repeat for manual coordinate edits and preset spot changes.

#### 4a. Preset spot changes need the same stale-request protection

- **Severity:** Medium.
- **File involved:** `app/features/mushroom-mood/MushroomMood.tsx`.
- **Problem:** The latest UI fix aborts prior requests in `checkReadiness()`, but preset spot selection only clears visible result state. If a request is already in flight when a preset button is clicked, the old response can still arrive and repopulate the result for the earlier spot.
- **User impact:** The result card can again disagree with the visible spot controls, which undermines the selected spot/context clarity requirement.
- **Recommended fix:** Apply the same abort or request-key invalidation used for coordinate and species edits when preset buttons change the spot.
- **Recommended validation:** Start a check, click a preset while the request is in flight, and confirm the old response cannot reappear after resolution.

### Low / test coverage severity

#### 5. Rainfall wording fix is not directly locked by a mapper regression test

- **Severity:** Low / test coverage.
- **Files involved:** `lib/viewModels/readinessResultViewModel.ts`, `tests/lib/viewModels/readinessResultViewModel.test.ts`.
- **Problem:** The mapper copy now says `rainfall measurements available`, which addresses the overclaiming concern. The targeted test suite does not directly assert this copy or assert that `days of rainfall data` / `days available` does not return.
- **User impact:** Low immediate risk because the current copy is correct, but future edits could regress the exact issue without failing tests.
- **Recommended fix:** Add a mapper regression test that sets `weatherEvidence.rainHistoryDays` and asserts the user-facing weather-history text contains `rainfall measurements available` and does not contain the older day-coverage wording.

### Documentation cleanup completed in this pass

- Earlier workflow artifacts contradicted the actual re-review state by simultaneously saying the targeted fixes were resolved and that independent-review-1 findings were still open. This documentation-only pass updates `current-work.md`, the execution log, this review file, the manual checklist, and beta checklist section `3` so the next action is clear.
- No source or test files were edited in this pass.

### Required next action

- Implement or explicitly accept finding 4 and finding 4a with rationale.
- Add or explicitly accept finding 5 with rationale.
- Rerun `npm test -- --passWithNoTests` and `npm run build` after any targeted implementation/test updates.
- Complete deployed/manual validation for a normal result and a degraded/fallback result before final beta checklist completion.

