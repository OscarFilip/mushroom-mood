# Mushroom Readiness Decision Log

## Decision

The application is a spot-first mushroom-readiness app rather than a generic weather-history app.

## Why

The core user question starts with a known or suspected mushroom spot and asks whether it is worth checking now for pickable fruit bodies.

## Alternatives considered

- Weather-first dashboard with mushrooms layered on top
- Species-first browsing as the primary product entry point

## Tradeoffs

- Spot-first framing gives a clearer product purpose.
- It makes saved-spot design and spot-based calculation context more important.

## Impacted files or areas

- `docs/feature-flows.md`
- `docs/uml/feature-start-page.puml`
- `docs/uml/feature-weather-page.puml`
- `docs/uml/feature-mushroom-page.puml`

---

## Decision

Spot metadata such as confirmed spot or possible spot is user organization only and should not affect the readiness calculation.

## Why

The app should not try to prove whether the species exists at the exact spot. The user already chooses a spot they care about, and regional observation data is incomplete compared with the true distribution of fungi.

## Alternatives considered

- Treat confirmed spot status as a probability factor
- Use exact prior fruiting at the spot as a core model input

## Tradeoffs

- This avoids false precision.
- It removes one potentially strong local signal, but the system cannot provide that signal in a reliable way.

## Impacted files or areas

- Saved-spot design
- Readiness calculation model
- Future feature-flow revisions

---

## Decision

The main result format should be readiness label plus probability percentage plus separate confidence.

## Why

Users need a simple practical answer, a numeric estimate, and a clear sense of how reliable that estimate is.

## Alternatives considered

- Readiness label only
- Probability percentage only
- Out-of-season as the lowest readiness label by default

## Tradeoffs

- This adds one more visible metric, but improves clarity and transparency.
- Seasonal state should be presented separately from the readiness label.

## Impacted files or areas

- Start-page flow
- Mushroom detail flow
- Result explanation design

---

## Decision

The calculation model should use seasonal factor, weather factor, and species profile behavior, where species profile behavior includes fruiting timing and growth-to-pickable timing.

## Why

Seasonality is often a strong gate, weather affects whether fruiting is supported now, and different species reach pickable size and spoil at different speeds.

## Alternatives considered

- Generic weather-only model
- Exact factor weighting finalized during early planning

## Tradeoffs

- The model is clear enough for planning without forcing final weights too early.
- Detailed weighting remains open for later refinement and expert contribution.

## Impacted files or areas

- Species profile strategy
- Readiness explanation
- Later architecture and algorithm design

---

## Decision

Use precipitation windows of 3, 7, 14, and 30 days for the first model design.

## Why

One long window loses timing structure. Multiple windows preserve recent trigger conditions and longer-term moisture buildup.

## Alternatives considered

- 30-day total only
- Simpler 7, 14, 30-day setup

## Tradeoffs

- More windows increase model complexity slightly.
- They preserve biologically relevant timing information that a single cumulative window would hide.

## Impacted files or areas

- Weather-factor design
- Species profile tuning
- Transparent explanation of readiness

---

## Decision

Start with a curated species catalog, and allow the highest-level admin user to add new supported species through a restricted UI backed by the SLU taxon search API.

## Why

The full taxonomy is broader than the first product needs. A curated set is easier to design, explain, and maintain, while still allowing controlled expansion.

## Alternatives considered

- Include all fungal taxa up front
- Manual file-only species inclusion with no UI support

## Tradeoffs

- Curated inclusion reduces complexity and improves UX.
- It requires a management workflow for species inclusion.

## Impacted files or areas

- Species catalog design
- Restricted management UI planning
- Future architecture for admin capabilities

---

## Decision

Expert input and admin adjustment of species-specific algorithms are planned core features, but the detailed workflow is intentionally deferred.

## Why

The feature is important, but the exact submission, review, approval, and change process still needs a dedicated planning pass.

## Alternatives considered

- Finalize the expert workflow immediately
- Ignore expert contribution until after implementation

## Tradeoffs

- Deferral keeps current planning focused and honest.
- Later UML and architecture work must explicitly show that this area is planned but not fully designed.

## Impacted files or areas

- `docs/uml/feature-mushroom-probability.puml`
- Future permission and admin-flow planning
- Later architecture-flow work

---

## Decision

The first implementation slice should be the start-page readiness flow: manual or preset spot selection, single-species selection from a curated catalog, readiness lookup, and transparent result rendering.

## Why

This is the smallest useful end-to-end path that answers the core user question without depending on saved-spot persistence, admin flows, or advanced explanation features.

## Alternatives considered

- Start with species catalog browsing before readiness lookup
- Start with saved-spot persistence before the first readiness result
- Start with deep evidence views before the main result experience

## Tradeoffs

- This gives fast product validation against the core question.
- It requires restraint on adjacent features that may feel important but are not needed for the first useful slice.

## Impacted files or areas

- `app/page.tsx`
- `app/features/`
- `app/api/`
- `lib/services/`
- `docs/plans/active/mushroom-readiness-plan.md`

---

## Decision

The first curated species set for implementation is `Boletus edulis`, `Boletus reticulatus`, `Cantharellus cibarius`, and `Craterellus tubaeformis`.

## Why

This gives the first slice a small but meaningful set of recognizable target species without expanding the species catalog before the readiness flow is proven.

## Alternatives considered

- Start with only one species
- Add a larger mixed catalog before implementation

## Tradeoffs

- Four species are enough to exercise the selector and species-specific rules.
- The catalog remains intentionally small, so users will not yet see broader species coverage.

## Impacted files or areas

- Curated species catalog source for the first slice
- Start-page species selector
- First service and route tests

---

## Decision

The initial readiness-label vocabulary is `very-likely-worth-checking`, `worth-checking`, `possible-but-uncertain`, `unlikely-now`, `very-unlikely-right-now`, and `unknown`, while seasonal state remains a separate field.

## Why

These labels give a clear practical answer without mixing seasonal state into readiness or forcing false precision. They also distinguish between ordinary support and very strong support, and between ordinary low support and very strong reasons not to go now.

## Alternatives considered

- Binary yes or no labels only
- More granular readiness steps before implementation
- Using `out-of-season` as a readiness label

## Tradeoffs

- The labels are simple enough for the first slice and can be explained clearly in the UI.
- Some wording may still evolve later, but the API and UI now have a stable first vocabulary.

## Impacted files or areas

- Readiness API response shape
- Start-page result rendering
- Explanation copy and tests

---

## Decision

Transient upstream weather fetch failures should be retried inside `ApiClient`, but only for safe requests and only for retryable network-level timeout or socket errors.

## Why

The mushroom-readiness route depends on SMHI endpoints that can intermittently fail to connect even when the same request succeeds moments later. Handling that at the shared fetch boundary reduces flaky `500` responses without spreading retry rules across routes and services.

## Alternatives considered

- Retry inside `rainHistoryService` only
- Retry every failed request regardless of method or error type
- Return upstream failures directly without retrying

## Tradeoffs

- Centralizing the policy in `ApiClient` keeps the retry behavior consistent for read-only upstream calls.
- Limiting retries to safe methods avoids duplicating side effects for `POST` requests.
- Restricting retries to network-level timeout and socket failures avoids masking deterministic HTTP or validation errors.

## Impacted files or areas

- `lib/repositories/apiClient.ts`
- `tests/lib/repositories/apiClient.test.ts`
- Mushroom-readiness and weather-history upstream GET flows that use `ApiClient`

---

## Decision

The frontend should use Tailwind 4's CSS-first setup and should not keep unused legacy Tailwind config files when no custom theme or plugin configuration is needed.

## Why

The app was already on Tailwind 4 packages, but the stylesheet entry and surrounding config still looked like a Tailwind 3 setup. That left the repo with misleading configuration and made the styling failure harder to diagnose.

## Alternatives considered

- Keep the old config files in place after fixing only the CSS entry
- Reintroduce a Tailwind config file even though the app is using only default theme behavior

## Tradeoffs

- Removing unused legacy config makes the setup easier to reason about.
- If the app later needs custom theme tokens or plugins, a config file can be added back intentionally instead of lingering as dead configuration.

## Impacted files or areas

- `app/index.css`
- `postcss.config.js`
- Tailwind frontend styling setup