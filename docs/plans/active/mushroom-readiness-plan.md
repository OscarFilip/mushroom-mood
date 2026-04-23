# Mushroom Readiness Implementation Plan

## Summary

Define the product and planning model for a spot-first mushroom-readiness app. The app helps a user decide whether it is worth checking a known or suspected mushroom spot now for pickable fruit bodies.

## Goal

Create a stable planning base for revised feature-flow UMLs, the first target-state architecture work, and the first implementation slice. The app should answer whether a chosen spot for a chosen species is worth checking now, using transparent factors and a curated species catalog.

## Scope

- In scope: spot-first product framing, calculation factors, output format, curated species strategy, saved-spot design direction, and a note that the expert workflow is deferred.
- In scope: decisions needed to revise feature-flow diagrams, define an initial target-state architecture, and specify the first implementation slice.
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

Key planning context:

- The core user question is: "I have a place where I know mushroom species X grows or may grow. Is now a good time to go there and look for pickable fruit bodies?"
- The app should not try to prove the species exists at the exact spot.
- Spot status such as confirmed or possible is user metadata, not part of the readiness calculation.
- Seasonal factor should use SLU/ArtDatabanken observations near the chosen spot.

## Acceptance criteria

- The planning model clearly reflects a spot-first app instead of a generic weather dashboard.
- The main result format is defined as readiness label plus probability plus separate confidence.
- The factor model is clear enough to revise the feature-flow UMLs.
- The first implementation slice is narrow enough to build end to end without reopening global product decisions.
- Deferred design areas are explicitly recorded so they are not mistaken for settled decisions.

## Proposed approach

### User flow impact

Revise the planned feature flows so they center on:

- choose saved or entered spot first
- choose mushroom species second
- receive readiness label, probability, and confidence
- inspect a transparent explanation of seasonal state, weather support, and species profile behavior
- manage supported species through a restricted UI

The expert-input feature remains planned, but its detailed flow should stay marked as intentionally deferred.

### First implementation slice

The first slice should implement the smallest end-to-end version of the core user question:

- user enters coordinates or chooses a preset spot on the start page
- user selects one species from the first curated in-app catalog: `Boletus edulis`, `Boletus reticulatus`, `Cantharellus cibarius`, or `Craterellus tubaeformis`
- app requests one readiness result from a dedicated readiness API route
- app renders readiness label, probability, confidence, seasonal state, and short explanation summary
- app renders loading, validation, error, and insufficient-data states

The first slice should exclude:

- saved-spot persistence and account-linked spot management
- species management UI and admin-only inclusion tools
- contributor and expert workflow
- deeper weather-evidence page behavior beyond linking or placeholder navigation
- final factor tuning and advanced explanation breakdowns

### Architecture impact

The target-state architecture should cover these domains:

- saved spots
- curated species catalog
- species-specific profile rules
- SLU taxon lookup and observation lookup
- weather history data
- readiness calculation and confidence calculation
- species management and expert/admin algorithm input handling

For the first implementation slice, the expected code boundaries are:

- `app/page.tsx` as the entry page that hosts the first readiness experience
- a new mushroom-readiness UI feature module under `app/features/`
- a new API route for readiness lookup, likely `app/api/mushroom-readiness/route.ts`
- a new service module, likely `lib/services/mushroomReadinessService.ts`
- a small curated species catalog source for the first slice, likely static and repo-local
- reuse or adapt existing weather-history retrieval as weather evidence input when practical

### Testing approach

When this slice moves to implementation, add route and service tests first. UI tests can stay lighter if route and service tests cover the core request and response handling.

### First-slice contract sketch

Suggested request shape:

```text
GET /api/mushroom-readiness?latitude=<number>&longitude=<number>&species=<species-id>
```

Suggested success response shape:

```json
{
	"spot": {
		"latitude": 57.1134,
		"longitude": 12.7732
	},
	"species": {
		"id": "chanterelle",
		"displayName": "Chanterelle"
	},
	"result": {
		"readinessLabel": "worth-checking",
		"probabilityPercent": 68,
		"confidencePercent": 54,
		"seasonalState": "in-season"
	},
	"explanation": {
		"summary": "Recent rain supports fruiting, but confidence is limited by sparse seasonal evidence.",
		"weatherSupport": "supported",
		"seasonalSupport": "partial",
		"speciesTimingSupport": "supported"
	},
	"limitations": []
}
```

Suggested degraded response shape:

```json
{
	"spot": {
		"latitude": 57.1134,
		"longitude": 12.7732
	},
	"species": {
		"id": "chanterelle",
		"displayName": "Chanterelle"
	},
	"result": {
		"readinessLabel": "unknown",
		"probabilityPercent": null,
		"confidencePercent": 22,
		"seasonalState": "unknown"
	},
	"explanation": {
		"summary": "Weather data was available, but seasonal evidence was insufficient.",
		"weatherSupport": "supported",
		"seasonalSupport": "missing",
		"speciesTimingSupport": "supported"
	},
	"limitations": [
		"seasonal-evidence-unavailable"
	]
}
```

## Implementation steps

1. Record the agreed product and factor decisions in plan and decision-log artifacts.
2. Revise the planned feature-flow UMLs to match the spot-first mushroom readiness model.
3. Use the revised feature flows as the basis for target-state architecture planning.
4. Choose the first implementation slice from the planned boundaries.
5. Confirm the route shape, result shape, first species catalog, and initial readiness labels.
6. Switch to implementation stage and build the slice end to end.

## Risks

- The detailed expert-input workflow is still unresolved and could affect later page and permission design.
- Factor weighting remains intentionally non-final, so later architecture should preserve room for per-species tuning.

## Open questions

- How should confidence be rendered numerically and textually?
- What exact restricted UI should be used for species inclusion and later expert/admin workflow?

## Accepted defaults for first implementation slice

### Curated species set

- `boletus-edulis` - `Boletus edulis`
- `boletus-reticulatus` - `Boletus reticulatus`
- `cantharellus-cibarius` - `Cantharellus cibarius`
- `craterellus-tubaeformis` - `Craterellus tubaeformis`

### Readiness labels

- `very-likely-worth-checking` - current conditions strongly support checking now
- `worth-checking` - strong enough support to justify a trip now
- `possible-but-uncertain` - some support exists, but confidence or signal strength is limited
- `unlikely-now` - current conditions do not support checking now
- `very-unlikely-right-now` - current conditions strongly argue against checking now
- `unknown` - data is too incomplete for a meaningful readiness result

### Seasonal state labels

- `in-season`
- `shoulder-season`
- `out-of-season`
- `unknown`

## Implementation handoff trigger

Planning should hand over to implementation when these slice-local decisions are accepted:

- the first API route path and request shape
- the first result payload shape
- the first curated species set for implementation
- the first readiness-label vocabulary for UI and API use

Those decisions are now defined in this file, and the active handoff has moved to implementation. Continue implementation from `docs/plans/active/current-work.md` until the first slice is built and ready for review.

## Definition of done

- Planning decisions are captured in active planning files.
- Feature-flow revisions align with the settled product direction.
- The target-state architecture diagram reflects the same product boundaries and deferred decisions.
- Deferred decisions are documented explicitly.
- The project is ready to move from planning into implementation for the first slice.