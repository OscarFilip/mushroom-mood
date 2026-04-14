# Architecture

This page is for technical structure and implementation diagrams.

It separates current-state diagrams from target-state diagrams so the implemented architecture and planned changes do not get mixed together.

## What belongs here

- Page and route structure
- Service and repository boundaries
- External API integration design
- Data flow between app layers

## Current status

The repository currently has a feature flow in [feature-flows.md](./feature-flows.md) and both a current-state and target-state architecture diagram for the nearest-station weather feature.

## Available architecture diagrams

### Current-state nearest station weather architecture

This diagram shows the architecture that is implemented in the app now.

Rendered SVG: generated into `./uml/out/architecture-nearest-station-weather.svg`

![Current-state nearest station weather architecture](./uml/out/architecture-nearest-station-weather.svg)

Source: [architecture-nearest-station-weather.puml](./uml/architecture-nearest-station-weather.puml)

### Target-state nearest station weather architecture

This diagram shows the planned architecture for persisted station catalog data and cached weather data.

Rendered SVG: generated into `./uml/out/architecture-nearest-station-weather-target.svg`

![Target-state nearest station weather architecture](./uml/out/architecture-nearest-station-weather-target.svg)

Source: [architecture-nearest-station-weather-target.puml](./uml/architecture-nearest-station-weather-target.puml)

## Working approach

- Keep one current-state architecture diagram that matches the implemented code.
- Create a separate target-state diagram when designing a significant architectural change.
- Keep target-state diagrams at the same abstraction level as current-state diagrams: focus on responsibilities and boundaries, not low-level implementation steps.
- Once the new design is implemented and stable, update the current-state diagram and remove or archive the target-state draft.