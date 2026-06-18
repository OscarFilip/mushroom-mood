# Feature Flows

This page collects user-facing flow diagrams.

Use this rule:

- `docs/uml/feature/current/`: implemented flows
- `docs/uml/feature/target/`: planned or in-progress flows

## Current flows

### Readiness result clarity

The current main flow: choose a spot and species, then see a readiness result with probability, confidence, seasonal state, and supporting evidence.

![Readiness result clarity feature flow](./uml/out/feature/current/mushroom-probability.svg)

Source: [mushroom-probability.puml](./uml/feature/current/mushroom-probability.puml)

### Nearest-station weather

Weather-history flow from opening the feature to seeing results or an error state.

![Nearest station weather feature flow](./uml/out/feature/current/nearest-station-weather.svg)

Source: [nearest-station-weather.puml](./uml/feature/current/nearest-station-weather.puml)

### Beta access control

Beta-only entry flow: email magic-link sign-in, invite-only access, denied states, and logout.

Feedback persistence exists as technical foundation, but a user-visible feedback submission surface is not shown here unless it is exposed in the implemented UI.

![Beta access control feature flow](./uml/out/feature/current/beta-access-control.svg)

Source: [beta-access-control.puml](./uml/feature/current/beta-access-control.puml)

## Target flows

Target diagrams describe planned behavior and should not be read as implemented unless the corresponding current diagram has been updated.

- [Beta access control target](./uml/feature/target/beta-access-control.puml)
- [Start page target](./uml/feature/target/start-page.puml)
- [Weather page target](./uml/feature/target/weather-page.puml)
- [Mushroom page target](./uml/feature/target/mushroom-page.puml)
- [Mushroom probability detail target](./uml/feature/target/mushroom-probability.puml)
- [Account page target](./uml/feature/target/account-page.puml)
- [Settings page target](./uml/feature/target/settings-page.puml)

## What belongs here

Add or update a feature-flow diagram when a change affects:

- login or access behavior
- weather lookup behavior
- readiness result behavior
- feedback behavior
- error or empty states that change what the user can do

Keep feature-flow diagrams focused on user-visible behavior. Use [architecture.md](./architecture.md) for technical boundaries.
