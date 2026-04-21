# Mushroom Readiness Implementation Plan

## Summary

Define the product and planning model for a spot-first mushroom readiness application that helps a user decide whether it is worth checking a known or suspected mushroom spot now for pickable fruit bodies.

## Goal

Create a stable planning basis for revising the feature-flow UMLs and the first target-state architecture work. The app should answer whether a chosen spot for a chosen species is worth checking now, using transparent factors and a curated species catalog.

## Scope

- In scope: spot-first product framing, calculation-factor framing, output format, curated species strategy, saved-spot design direction, and deferred expert-workflow note.
- In scope: decisions needed to revise feature-flow diagrams and define an initial target-state architecture.
- Out of scope: implementation details for the expert-input workflow, code changes, and final factor weighting formulas.

## Context

Relevant files and prior work:

- `docs/feature-flows.md`
- `docs/architecture.md`
- `docs/uml/feature-start-page.puml`
- `docs/uml/feature-weather-page.puml`
- `docs/uml/feature-mushroom-page.puml`
- `docs/uml/feature-mushroom-probability.puml`
- `docs/uml/architecture-mushroom-readiness-target.puml`

Key planning context from discussion:

- The core user question is: "I have a place where I know mushroom species X grows or may grow. Is now a good time to go there and look for pickable fruit bodies?"
- The app should not try to prove the species exists at the exact spot.
- Spot status such as confirmed or possible is user metadata, not part of the readiness calculation.
- Seasonal factor should use SLU/ArtDatabanken observations near the chosen spot.

## Acceptance criteria

- The planning model clearly reflects a spot-first app instead of a generic weather dashboard.
- The main result format is defined as readiness label plus probability plus separate confidence.
- The factor model is clear enough to revise the feature-flow UMLs.
- Deferred design areas are explicitly recorded so they are not mistaken for settled decisions.

## Proposed approach

### User flow impact

Revise the planned feature flows so they center on:

- choose saved or entered spot first
- choose mushroom species second
- receive readiness label, probability, and confidence
- inspect a transparent explanation of seasonal state, weather support, and species profile behavior
- manage supported species through a restricted UI

The expert-input feature remains planned, but its detailed flow should be marked as intentionally deferred.

### Architecture impact

The target-state architecture should cover the following domains:

- saved spots
- curated species catalog
- species-specific profile rules
- SLU taxon lookup and observation lookup
- weather history data
- readiness calculation and confidence calculation
- species management and expert/admin algorithm input handling

### Testing approach

No code tests are in scope yet. Planning quality should be reviewed against the approved decisions before architecture planning starts.

## Implementation steps

1. Record the agreed product and factor decisions in plan and decision-log artifacts.
2. Revise the planned feature-flow UMLs to match the spot-first mushroom readiness model.
3. Use the revised feature flows as the basis for target-state architecture planning.
4. Choose the first implementation slice from the planned boundaries.

## Risks

- The detailed expert-input workflow is still unresolved and could affect later page and permission design.
- Factor weighting remains intentionally non-final, so later architecture should preserve room for per-species tuning.

## Open questions

- What exact readiness labels should be used in the UI text?
- How should confidence be rendered numerically and textually?
- What exact restricted UI should be used for species inclusion and later expert/admin workflow?

## Definition of done

- Planning decisions are captured in active planning files.
- Feature-flow revisions align with the settled product direction.
- The target-state architecture diagram reflects the same product boundaries and deferred decisions.
- Deferred decisions are documented explicitly.
- The project is ready to move from feature-flow planning into architecture planning.