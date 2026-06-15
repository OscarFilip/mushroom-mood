# readiness-result-clarity Decision Log

## Decision

Keep the slice narrow and implement only beta launch checklist section `3. Readiness result clarity`.

## Why

This keeps the next beta-blocking task focused on whether testers can understand readiness results. Feedback capture, onboarding, privacy note, operations, monitoring, and broader dependency resilience are separate checklist areas.

## Alternatives considered

- Combine result clarity with feedback capture.
- Combine result clarity with onboarding/disclaimer work.
- Combine result clarity with broader external-dependency resilience.

## Tradeoffs

- A narrow slice reduces implementation and review risk.
- Some limitation/fallback copy overlaps with dependency resilience and disclaimer work, but it is included only where needed to make the readiness result understandable.
- The broader beta disclaimer/onboarding experience remains future work.

## Impacted files or areas

- `docs/plans/active/beta-launch-checklist.md`, section `3. Readiness result clarity`
- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/services/mushroomReadinessService.ts`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper

---

## Decision

Use a main result card plus three details sections: `Weather signals`, `Seasonal evidence`, and `Species fit`.

## Why

The main result should be understandable at a glance, while evidence details should be available without overwhelming the card.

## Alternatives considered

- Show all evidence and raw counts directly in the main card.
- Hide evidence behind developer-only logs.
- Use a long prose explanation only.

## Tradeoffs

- Details sections add some UI work, but avoid a dense result card.
- Keeping raw counts out of the main view makes the beta UI clearer but gives less debugging data to testers.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper
- Feature-flow docs/diagrams if the visible result flow materially changes

---

## Decision

Display readiness and confidence as separate `0/100` scores, with confidence label-first copy.

## Why

The app already has `probabilityPercent` and `confidencePercent`. Showing both as percentages can make users confuse readiness with confidence. The agreed display is:

```text
Readiness score: 72/100
Confidence: Medium · 43/100
```

## Alternatives considered

- Keep `Probability: 72%` and `Confidence: 43%`.
- Show only confidence labels with no number.
- Hide confidence entirely.

## Tradeoffs

- `N/100` is still a numeric score and can be interpreted as a probability, so disclaimer and cautious labels remain important.
- Label-first confidence preserves useful detail while making confidence distinct from readiness.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper
- mapper/unit tests for score formatting

---

## Decision

Use these readiness labels in the UI:

| Current code value | UI label |
| --- | --- |
| `very-likely-worth-checking` | `Strong signal to check` |
| `worth-checking` | `Worth checking` |
| `possible-but-uncertain` | `Maybe worth checking` |
| `unlikely-now` | `Probably wait` |
| `very-unlikely-right-now` | `Wait for better conditions` |
| `unknown` | `Can’t assess right now` |

## Why

The labels should be short, clear, and less biologically overclaiming than phrases such as `Very likely` or statements that imply mushrooms are present.

## Alternatives considered

- Keep the current labels.
- Use stronger probability language such as `High chance`.
- Use generic states such as `Good`, `Okay`, and `Bad`.

## Tradeoffs

- `Strong signal to check` is more cautious than `Very likely worth checking`, but slightly less compact.
- `Can’t assess right now` is clearer than `Unknown` but depends on the UI also showing the reason.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper

---

## Decision

Use `High`, `Medium`, and `Low` confidence labels with helper copy, and rename `Moderate` to `Medium`.

## Why

`Medium` is clearer and more common for beta users. The label plus number makes confidence understandable without pretending it is the same thing as readiness.

## Alternatives considered

- Keep `Moderate`.
- Show only numeric confidence.
- Show a longer confidence explanation directly in the main metric.

## Tradeoffs

- Helper copy adds translation logic, but prevents the confidence score from looking arbitrary.
- The main UI should keep the helper short to avoid crowding.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper
- `tests/lib/viewModels/readinessResultViewModel.test.ts`

---

## Decision

Add the smallest data-contract additions needed for result clarity: checked timestamp, weather evidence, and explicit seasonal evidence source.

## Why

The current payload has enough for the basic result, confidence, species, coordinates, seasonal quality, and limitations, but not enough to show all weather evidence or an explicit observation-backed versus calendar-fallback source. The service already computes rain windows and average temperature internally, so exposing those values avoids duplicating calculations in the UI.

## Alternatives considered

- Infer weather evidence on the client.
- Do not expose weather evidence and rely on summary text only.
- Infer seasonal source from evidence quality only.

## Tradeoffs

- Adding response fields requires updating service and route tests.
- Exposing more evidence can make the UI noisy if not mapped carefully.
- Explicit source avoids fragile UI inference.

## Impacted files or areas

- `lib/services/mushroomReadinessService.ts`
- `app/api/mushroom-readiness/route.ts`
- `app/features/mushroom-mood/MushroomMood.tsx`
- `tests/lib/services/mushroomReadinessService.test.ts`
- `tests/app/api/mushroom-readiness/route.test.ts`

---

## Decision

Create a UI-facing mapper/view model for readiness result display.

## Why

The current UI renders technical limitation codes by replacing hyphens with spaces. Deliberate user-facing copy belongs in a mapper or view-model layer so service types stay service-oriented and the component stays focused on rendering.

## Alternatives considered

- Put all copy directly inside `MushroomMood.tsx`.
- Put user-facing copy directly inside the readiness service.
- Keep raw codes in the UI.

## Tradeoffs

- A mapper adds one small abstraction and tests.
- The mapper keeps product copy testable and reduces future component complexity.

## Impacted files or areas

- `lib/viewModels/readinessResultViewModel.ts`
- `tests/lib/viewModels/readinessResultViewModel.test.ts`
- `app/features/mushroom-mood/MushroomMood.tsx`

---

## Decision

Expose summarized evidence by default and keep raw seasonal counts out of the main result UI.

## Why

Beta testers need to understand why a result happened, not debug the seasonality model. Counts such as raw observations, weighted observation score, and distinct observation years are useful internally but can distract or imply false precision.

## Alternatives considered

- Show raw counts in the main card.
- Hide all evidence and show only the final score.
- Add a fully technical debug panel for beta testers.

## Tradeoffs

- Summary evidence gives less debugging detail in the UI.
- If raw counts are needed later, they can be placed in a developer/debug view, not the normal beta result.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper

---

## Decision

Use a short disclaimer with every result:

```text
This is a readiness signal based on weather and season patterns. It does not guarantee mushrooms are present, and it is not identification or safety advice.
```

## Why

The result should not biologically overclaim or imply edibility/identification/safety advice. The disclaimer is part of result clarity for this slice, while the broader beta privacy/onboarding disclaimer remains separate checklist work.

## Alternatives considered

- Defer all disclaimer text to the onboarding/privacy slice.
- Show the disclaimer only on degraded results.
- Use a longer legal-style disclaimer.

## Tradeoffs

- Repeating the disclaimer with every result takes UI space.
- A short result-level disclaimer is easier to understand and reduces overclaiming risk.

## Impacted files or areas

- `app/features/mushroom-mood/MushroomMood.tsx`
- `lib/viewModels/readinessResultViewModel.ts` or equivalent mapper
- mapper/component tests

---

## Decision

Follow the repository test recommendations: unit-test pure mapping/copy, update service/route tests for response-shape changes, run `npm test`, run `npm run build`, and manually validate normal plus degraded/fallback results in the deployed environment.

## Why

The repo definition of done requires important states, diagrams/docs alignment when behavior changes, tests, `npm test`, and `npm run build`. This slice changes user-visible behavior and a small service/API response shape.

## Alternatives considered

- Manual-only validation because this is mostly UI copy.
- Service-only tests without mapper tests.
- Defer deployed validation until final beta gate.

## Tradeoffs

- Mapper tests add upfront work but make the copy states safer to change.
- Deployed validation may require mocked or seeded degraded states if live data does not naturally produce them.

## Impacted files or areas

- `tests/lib/viewModels/readinessResultViewModel.test.ts`
- `tests/lib/services/mushroomReadinessService.test.ts`
- `tests/app/api/mushroom-readiness/route.test.ts`
- `docs/plans/active/readiness-result-clarity-execution-log.md`
- `docs/plans/active/readiness-result-clarity-manual-review-checklist.md`
