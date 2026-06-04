# Feature Flows

This page collects diagrams for user-facing behavior.

## Current implemented flow

### Nearest-station weather

This diagram shows the weather-history flow from opening the feature to seeing results or an error state.

Rendered SVG: `./uml/out/feature-nearest-station-weather.svg`

![Nearest station weather feature flow](./uml/out/feature-nearest-station-weather.svg)

Source: [feature-nearest-station-weather.puml](./uml/feature-nearest-station-weather.puml)

It complements the architecture diagrams in [architecture.md](./architecture.md) but stays focused on what the user sees.

## Planned main-page flows

These diagrams describe the main user journeys that will guide upcoming architecture, testing, and implementation work.

### Start page

This diagram shows the main spot-check flow: choose a saved or entered spot, choose a mushroom species, and get a readiness result with probability, confidence, and seasonal state.

Rendered SVG: `./uml/out/feature-start-page.svg`

![Start page feature flow](./uml/out/feature-start-page.svg)

Source: [feature-start-page.puml](./uml/feature-start-page.puml)

### Weather page

This diagram shows the evidence flow on the weather page. The user can inspect the weather and seasonal inputs behind a readiness result and switch spot or species.

Rendered SVG: `./uml/out/feature-weather-page.svg`

![Weather page feature flow](./uml/out/feature-weather-page.svg)

Source: [feature-weather-page.puml](./uml/feature-weather-page.puml)

### Mushroom page

This diagram shows the species-catalog flow: browse or search supported mushrooms, inspect species details, and, for restricted users, manage which species the app supports.

Rendered SVG: `./uml/out/feature-mushroom-page.svg`

![Mushroom page feature flow](./uml/out/feature-mushroom-page.svg)

Source: [feature-mushroom-page.puml](./uml/feature-mushroom-page.puml)

### Mushroom probability detail

This supporting diagram shows what happens after a user opens a mushroom detail or readiness explanation and wants to understand why a result appears. It now reflects the implemented explanation transparency flow and still includes the later planned expert-input path.

Rendered SVG: `./uml/out/feature-mushroom-probability.svg`

![Mushroom probability detail flow](./uml/out/feature-mushroom-probability.svg)

Source: [feature-mushroom-probability.puml](./uml/feature-mushroom-probability.puml)

## Planned side-page flows

These diagrams are lighter than the main-page flows. They reserve space in the planning set without forcing more detail than the current product scope supports.

### Account page

This diagram shows the basic account-area flow: open account pages, inspect profile or access information, and manage future account actions when that scope is defined.

Rendered SVG: `./uml/out/feature-account-page.svg`

![Account page feature flow](./uml/out/feature-account-page.svg)

Source: [feature-account-page.puml](./uml/feature-account-page.puml)

### Settings page

This diagram shows the settings flow: open settings, review preferences, change values, and save them.

Rendered SVG: `./uml/out/feature-settings-page.svg`

![Settings page feature flow](./uml/out/feature-settings-page.svg)

Source: [feature-settings-page.puml](./uml/feature-settings-page.puml)

## What belongs here

- login and signup flows
- weather search and filtering flows
- weather history lookup and result flows
- error and empty-state flows that change user behavior