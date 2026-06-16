# readiness-result-clarity Implementation Plan

## Summary

Improve the Mushroom Mood readiness result so a beta tester can understand what the result means, why it was produced, how confident the app is, which evidence was weak or missing, and that the result is a readiness signal rather than a biological guarantee or safety recommendation.

This plan records the approved scope and copy decisions for beta launch checklist section `3. Readiness result clarity`.

## Slice boundary

- This slice includes:
  - clearer readiness label and score display
  - confidence label plus `0/100` confidence score
  - selected spot, selected species, and checked timestamp/context
  - key weather evidence used by the calculation
  - key seasonal evidence and source/fallback state
  - species-fit explanation based on the selected species profile
  - plain-language limitation and fallback copy
  - no-guarantee / no-safety-advice disclaimer shown with readiness results
  - tests and manual validation needed for this UI/data-contract change
- This slice does not include:
  - feedback capture or feedback review UI
  - onboarding or first-run guide
  - beta privacy note beyond the readiness-result disclaimer
  - monitoring, alerts, operations ownership, or beta pause criteria
  - saved spots, public marketing pages, access-control changes, or invite management
  - species-management editing or admin surfaces
  - broad external-dependency resilience work beyond showing existing degraded/fallback states in the readiness result
- Review this slice against:
  - `docs/plans/active/beta-launch-checklist.md`, section `3. Readiness result clarity`
  - `docs/done-and-testing.md`
  - this plan and `readiness-result-clarity-decision-log.md`

## Goal

A tester-like user can read the result without developer docs and understand:

- whether the spot is worth checking now
- the readiness score as a bounded signal, not a guarantee
- the confidence level and score
- what spot, species, and time the result applies to
- what weather evidence mattered
- what seasonal evidence source was used
- when fallback, sparse, stale, missing, or expanded evidence made the result less certain
- how the selected species profile affected the result
- that the app does not identify mushrooms, guarantee mushrooms are present, or provide safety/edibility advice

## Scope

- In scope: reshape the result UI into a concise main card and explanation/details sections.
- In scope: add or map UI-facing copy for labels, confidence, weather, seasonal evidence, species fit, limitations, and disclaimer.
- In scope: add the smallest response-shape additions needed for timestamp, weather evidence, and explicit seasonal evidence source.
- In scope: hide raw seasonal evidence internals from the main result UI.
- Out of scope: changing scoring thresholds or recalibrating the readiness model except where tests need updates for added fields.
- Out of scope: adding new external API fallback behavior that is not already part of the readiness flow.

## Context

Relevant current implementation areas:

- `app/features/mushroom-mood/MushroomMood.tsx` renders the current result UI.
- `app/api/mushroom-readiness/route.ts` exposes the readiness API.
- `lib/services/mushroomReadinessService.ts` computes readiness, probability, confidence, seasonal state, explanation support, seasonal evidence summary, and limitations.
- `lib/data/mushroomSpecies.ts` contains curated species profile inputs for season months, peak months, temperature thresholds, and rain thresholds.
- `lib/repositories/seasonalObservationRepository.ts` returns seasonal observation evidence quality, radius/lookback, counts, and limitation codes.
- `tests/lib/services/mushroomReadinessService.test.ts` already covers readiness response behavior, seasonal fallback, stale cache, limitations, and confidence bounds.
- `tests/app/api/mushroom-readiness/route.test.ts` covers the API route.

Current response shape already has:

- `spot.latitude`, `spot.longitude`
- `species.id`, `species.displayName`, `species.latinName`
- `result.readinessLabel`
- `result.probabilityPercent`
- `result.confidencePercent`
- `result.seasonalState`
- `explanation.summary`
- `explanation.weatherSupport`
- `explanation.seasonalSupport`
- `explanation.seasonalEvidence.quality`
- `explanation.seasonalEvidence.radiusUsedMeters`
- `explanation.seasonalEvidence.lookbackYearsUsed`
- `explanation.seasonalEvidence.rawObservationCount`
- `explanation.seasonalEvidence.weightedObservationCount`
- `explanation.seasonalEvidence.distinctObservationYears`
- `limitations[]`

Known gaps to fill:

- no explicit `checkedAt` timestamp in the response
- no returned weather evidence values even though the service computes rain windows and average temperature internally
- no explicit seasonal evidence `source`, so the UI must infer observation-backed versus static calendar fallback from quality and service behavior
- current UI shows readiness as probability percent and confidence as percent, which can make the two concepts compete
- current UI renders raw limitation codes by replacing hyphens with spaces
- current UI exposes raw seasonal counts in the main result area

## Acceptance criteria

- The main result card shows readiness label, readiness score, confidence, selected spot, selected species, and checked timestamp/context.
- The readiness score is displayed as `N/100`, not as the only concept named probability.
- Confidence is displayed as a label plus score, for example `Medium · 43/100`; use `High`, `Medium`, and `Low` labels.
- The UI clearly distinguishes readiness score from confidence score.
- The UI shows weather evidence for precipitation, temperature, and weather-history coverage when those values are available.
- The UI shows seasonal evidence source/state using plain language: observation-backed, sparse, missing, widened radius/lookback, stale cache, unavailable, or static calendar fallback as applicable.
- The UI shows a short species-fit explanation using the selected species profile.
- Fallback and limitation states are translated into deliberate user-facing copy.
- Raw seasonal counts and scoring internals are not shown in the main result UI.
- Every readiness result, including unknown/degraded results, includes no-guarantee and no-identification/safety-advice copy.
- Automated tests cover the mapper/copy states and any service or route response-shape changes.
- `npm test` and `npm run build` pass before review handoff, or the execution log explains why they were not run.
- Deployed/manual validation confirms that a tester-like user can understand at least one normal result and at least one degraded/fallback result without developer docs.

## Handoff readiness for implementation

- Code paths expected to change:
  - `lib/services/mushroomReadinessService.ts`
  - `app/features/mushroom-mood/MushroomMood.tsx`
  - new UI-facing mapper/view model file, recommended: `lib/viewModels/readinessResultViewModel.ts`
  - `tests/lib/services/mushroomReadinessService.test.ts`
  - new mapper tests, recommended: `tests/lib/viewModels/readinessResultViewModel.test.ts`
  - `tests/app/api/mushroom-readiness/route.test.ts` if route snapshots/shape expectations need updates
- Required tests or checks before review handoff:
  - mapper/unit tests for labels, confidence, limitation copy, seasonal evidence copy, weather evidence copy, and disclaimer presence
  - service tests for `checkedAt`, `weatherEvidence`, and explicit seasonal evidence `source` if those fields are added in the service
  - route tests for response shape if the route asserts body shape
  - existing readiness tests remain green
  - `npm test`
  - `npm run build`
- Known risks to call out to the reviewer:
  - UI copy can overclaim mushroom presence if summary text remains too strong.
  - Weather evidence may be missing when weather data is unavailable; unknown/degraded states must remain understandable.
  - Seasonal fallback source must be explicit enough that sparse/missing evidence does not look as strong as observation-backed evidence.
  - Avoid leaking technical model internals into the main beta UI.

## Proposed approach

### User flow impact

The spot-check flow remains the same: the user chooses a spot and species and checks readiness.

Only the result presentation changes:

1. Main result card shows the result summary.
2. Compact metrics show readiness score, confidence, and seasonal timing.
3. Details explain weather signals, seasonal evidence, and species fit.
4. Limitation/fallback copy appears when evidence is weak, missing, stale, unavailable, or broadened.
5. Disclaimer appears with every result.

### Information architecture

#### Main result card

Show:

- `Readiness`
- readiness label
- selected species display name and Latin name
- selected spot, using coordinates unless a display name exists later
- checked timestamp
- readiness score as `N/100` or `—` when unknown
- confidence as `{High|Medium|Low} · N/100`
- seasonal timing label
- a short limitation banner when limitations exist
- the no-guarantee/no-safety-advice disclaimer

#### Details section

Use three compact sections:

1. `Weather signals`
2. `Seasonal evidence`
3. `Species fit`

These sections should be readable by normal beta testers and should avoid model-internal language.

### User-facing copy

#### Main labels

- Readiness label field: `Readiness`
- Readiness score field: `Readiness score`
- Confidence field: `Confidence`
- Spot field: `Spot`
- Species field: `Species`
- Checked timestamp field: `Checked`
- Seasonal timing field: `Seasonal timing`
- Details intro/title: `Why this result?`

#### Readiness labels

| Current code value | UI label |
| --- | --- |
| `very-likely-worth-checking` | `Strong signal to check` |
| `worth-checking` | `Worth checking` |
| `possible-but-uncertain` | `Maybe worth checking` |
| `unlikely-now` | `Probably wait` |
| `very-unlikely-right-now` | `Wait for better conditions` |
| `unknown` | `Can’t assess right now` |

#### Confidence labels

- `70–100`: `High · N/100`
- `40–69`: `Medium · N/100`
- `<40`: `Low · N/100`

Confidence helper copy:

| Confidence | Helper copy |
| --- | --- |
| High | `The main weather and season signals are available.` |
| Medium | `Some signals are weaker, older, or less local than ideal.` |
| Low | `Important evidence is missing or uncertain.` |

Use `Medium`, not `Moderate`.

#### Weather signals copy

Section title: `Weather signals`

Labels:

- `Recent rain`
- `Moisture history`
- `Temperature`
- `Weather history`

Examples:

- `Recent rain supports this result.`
- `Rain has been limited recently.`
- `Temperatures are within the expected range for this species.`
- `Weather history was available for this check.`
- `Temperature data was unavailable, so confidence is lower.`
- `Rainfall history is limited, so confidence is lower.`
- `Weather data was unavailable, so readiness could not be assessed.`

Preferred metric examples:

- `18 mm over 7 days`
- `34 mm over 14 days`
- `16°C average over 7 days`
- `30 days of rainfall data used`

#### Seasonal evidence copy

Section title: `Seasonal evidence`

| State or limitation | User-facing copy |
| --- | --- |
| sufficient + observation-backed | `Based on local observation patterns for this species.` |
| sparse evidence | `Local observations are limited, so the app used the species calendar.` |
| missing evidence | `No useful local observations were found, so the app used the species calendar.` |
| `seasonal-evidence-expanded-radius` | `The app widened the search area because nearby observations were limited.` |
| `seasonal-evidence-expanded-lookback` | `The app looked further back in time because recent observations were limited.` |
| `seasonal-evidence-stale-cache` | `Using recently cached seasonal evidence because fresh observation data was unavailable.` |
| `seasonal-evidence-unavailable` | `Observation data was unavailable, so seasonal timing is less certain.` |
| static calendar fallback | `Seasonality is based on the species calendar, not local observations.` |

Do not show terms such as `KDE`, `weighted observation count`, `radius ladder`, or `static fallback` in the main user-facing copy.

#### Species fit copy

Section title: `Species fit`

Recommended compact template:

```text
{Species display name} usually responds to recent rain, suitable temperatures, and the right seasonal timing. This result compares today’s signals with that species profile.
```

Optional compact species facts from `CURATED_SPECIES` may appear in details:

- `Typical season: Jun–Sep`
- `Best temperature range: 15–22°C`
- `Rain signal: 10 mm+ over 7 days`

Do not present these values as edibility, identification, or safety guidance.

#### Limitation banner

Show one compact banner when limitations exist.

Title: `Result limitation`

Generic copy:

```text
Some evidence was missing or less local than ideal, so treat this result as less certain.
```

Then show translated limitation bullets only when useful.

#### Disclaimer

Show this with every result, including unknown results:

```text
This is a readiness signal based on weather and season patterns. It does not guarantee mushrooms are present, and it is not identification or safety advice.
```

### Architecture impact

Prefer a UI-facing mapper/view model so raw API/service details do not directly control user copy.

Recommended file:

- `lib/viewModels/readinessResultViewModel.ts`

Recommended responsibilities:

- map raw `ReadinessResult` into render-ready sections
- format readiness score as `N/100`
- format confidence as `{High|Medium|Low} · N/100`
- translate readiness labels
- translate seasonal state labels
- translate limitation codes
- summarize seasonal evidence source and fallback behavior
- summarize weather evidence
- include disclaimer copy
- hide raw seasonal counts from the main display model

Recommended response-shape additions in `lib/services/mushroomReadinessService.ts`:

```ts
checkedAt: string;
```

```ts
weatherEvidence: {
  rain3DayMm: number;
  rain7DayMm: number;
  rain14DayMm: number;
  rain30DayMm: number;
  rainHistoryDays: number;
  averageTemperature7DayC: number | null;
  rainStationName?: string;
  temperatureStationName?: string;
};
```

```ts
seasonalEvidence: {
  quality: 'sufficient' | 'sparse' | 'missing';
  source: 'observation-backed' | 'species-calendar';
  radiusUsedMeters: number | null;
  lookbackYearsUsed: number | null;
  rawObservationCount: number | null;
  weightedObservationCount: number | null;
  distinctObservationYears: number | null;
};
```

The existing nested `explanation.seasonalEvidence` can either be extended with `source` or replaced carefully, but avoid creating two conflicting seasonal evidence shapes.

### Testing approach

Follow `docs/done-and-testing.md`: pure mapper logic should have unit tests, route/service behavior should have integration-style tests where multiple layers are involved, and `npm test` plus `npm run build` are required before done.

Recommended new unit tests in `tests/lib/viewModels/readinessResultViewModel.test.ts`:

1. `confidencePercent: 43` renders as `Medium · 43/100`.
2. readiness score renders as `72/100`, not `72%`.
3. `seasonal-evidence-expanded-radius` maps to clear copy.
4. `seasonal-evidence-expanded-lookback` maps to clear copy.
5. `seasonal-evidence-stale-cache` maps to clear copy.
6. `temperature-data-unavailable` maps to clear copy.
7. `weather-data-unavailable` produces `Can’t assess right now` and a degraded/unknown explanation.
8. unknown result still includes species, spot, confidence, limitation, and disclaimer.
9. raw seasonal evidence counts are not included in the main result display model.
10. no-guarantee disclaimer is present for normal and unknown results.

Recommended service/route tests if response-shape fields are added:

- service returns `checkedAt` based on injected `now`
- service returns rain windows and average temperature in `weatherEvidence`
- service returns `seasonalEvidence.source: 'observation-backed'` when sufficient observation evidence is used
- service returns `seasonalEvidence.source: 'species-calendar'` when sparse or missing evidence falls back to the species calendar
- route returns the new fields in the JSON response

Manual deployed validation:

1. Run a normal readiness result with enough evidence.
2. Run or mock one sparse/missing seasonal-evidence result.
3. Run or mock one static-calendar fallback result.
4. Confirm the main card is understandable without opening docs.
5. Confirm the tester can tell why the result happened.
6. Confirm the UI does not imply guaranteed mushrooms or eating safety.
7. Record screenshots or notes in the execution log or manual checklist.

### Review strategy

- Implementer self-check required before independent review: yes
- Independent reviewer or model: `review-agent` or separate review pass after implementation
- Re-review scope after fixes: changed files and any findings from first review
- Stop condition for review-fix loop: no blocking findings remain; non-blocking follow-ups are explicitly accepted or documented

## Implementation steps

1. Add or extend readiness response fields for `checkedAt`, weather evidence, and seasonal evidence source.
2. Add/update service tests for the new fields and fallback source behavior.
3. Create `lib/viewModels/readinessResultViewModel.ts` with label, score, confidence, limitation, weather, seasonal, species-fit, and disclaimer mapping.
4. Add mapper unit tests for normal, degraded, fallback, unknown, and limitation states.
5. Refactor `MushroomMood.tsx` to render from the mapper and use the approved main-card plus details-section IA.
6. Remove raw limitation-code rendering and replace it with deliberate copy.
7. Remove raw seasonal counts from the main result UI; keep only summarized evidence and optional compact details.
8. Run `npm test` and `npm run build`.
9. Update execution log with changed files, commands, results, and any manual validation notes.
10. Move to review and fill in `readiness-result-clarity-review.md`.

## Risks

- Users may interpret `Readiness score` as probability. Mitigate with disclaimer and avoid overclaiming copy.
- Confidence may still be confused with readiness if both are large numbers. Mitigate with label-first confidence and `N/100` formatting.
- Adding a response field in a way that conflicts with existing `explanation.seasonalEvidence` can create duplicated source-of-truth risk.
- Weather evidence can make the UI too dense. Keep the main card compact and put details in the explanation section.
- Existing summary text includes wording like `fruiting`; review it for overclaiming and replace or surround with cautious copy where needed.

## Open questions

- None blocking.
- Non-blocking implementation choice: whether to extend `explanation.seasonalEvidence` with `source` or move to a top-level/renamed evidence object. Prefer the smallest compatible change unless code clarity argues otherwise.
- Non-blocking implementation choice: whether weather station names should appear in the UI. They are useful in details but should not dominate the result card.

## Exit criteria for review handoff

- Implementation matches the planned slice boundary.
- Required tests or checks for this slice have been run.
- Known deviations, shortcuts, and risks are written down for review.

## Exit criteria for commit readiness

- Blocking review findings are resolved or explicitly accepted.
- The latest diff still matches the planned slice.
- Manual review is scoped to final regression and clarity checks only.

## Definition of done

- Implementation is complete.
- Tests cover the changed behavior.
- Relevant docs and diagrams are updated if behavior or boundaries changed.
- Review has been completed.
- Manual deployed validation confirms result clarity for normal and degraded/fallback states.
