# Mushroom Readiness Decision Log

## Decision

The application is a spot-first mushroom readiness app rather than a generic weather-history app.

## Why

The core user question starts from a known or suspected mushroom spot and asks whether it is worth checking now for pickable fruit bodies.

## Alternatives considered

- Weather-first dashboard with mushrooms layered on top
- Species-first browsing as the primary product entry point

## Tradeoffs

- Spot-first framing gives a clearer product purpose.
- It increases the importance of saved-spot design and spot-based calculation context.

## Impacted files or areas

- `docs/feature-flows.md`
- `docs/uml/feature-start-page.puml`
- `docs/uml/feature-weather-page.puml`
- `docs/uml/feature-mushroom-page.puml`

---

## Decision

Spot metadata such as confirmed spot or possible spot is user organization only and should not affect the readiness calculation.

## Why

The app should not attempt to prove whether the species exists at the exact spot. The user already chooses a spot they care about, and regional observation data is incomplete relative to the true distribution of fungi.

## Alternatives considered

- Treat confirmed spot status as a probability factor
- Use exact prior fruiting at the spot as a core model input

## Tradeoffs

- This avoids false precision.
- It removes one potentially strong local signal, but that signal is not reliably available from the system itself.

## Impacted files or areas

- Saved-spot design
- Readiness calculation model
- Future feature-flow revisions

---

## Decision

The main result format should be readiness label plus probability percentage plus separate confidence.

## Why

Users need a simple practical answer, a more specific numeric estimate, and clear communication of how reliable the estimate is.

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

Seasonality is often a strong gate, weather affects whether fruiting is supported now, and different species reach pickable size at different speeds and spoil at different speeds.

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

One long window loses timing structure. Multiple windows preserve both recent trigger conditions and longer-term moisture buildup.

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

The feature is strategically important, but the exact submission, review, approval, and change-application process still needs a dedicated planning pass.

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