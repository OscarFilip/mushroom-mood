# Feature Flows

This page collects diagrams that explain user-facing or business-facing behavior.

## Available feature flows

### Nearest station weather feature flow

This diagram shows the user-facing weather history flow from opening the feature to requesting data and seeing either results or an error state.

Rendered SVG: generated into `./uml/out/feature-nearest-station-weather.svg`

![Nearest station weather feature flow](./uml/out/feature-nearest-station-weather.svg)

Source: [feature-nearest-station-weather.puml](./uml/feature-nearest-station-weather.puml)

This feature flow complements the architecture diagrams in [architecture.md](./architecture.md), but stays focused on user-visible behavior instead of internal technical responsibilities.

## What belongs here

- Login and signup flows
- Weather search and filtering flows
- Rain-history lookup and result flows
- Error and empty-state flows when they affect user behavior