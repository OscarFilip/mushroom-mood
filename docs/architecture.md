# Architecture

This page summarizes the technical structure of Mushroom Mood.

Use this rule:

- `docs/uml/architecture/current/`: implemented flows
- `docs/uml/architecture/target/`: planned or in-progress flows

The app is a Next.js application with API routes, service-layer domain logic, repository-layer external API access, and beta-gated access control.

## Current structure

```text
UI components
  -> API routes
    -> services
      -> repositories
        -> external APIs / database
```

Key boundaries:

- UI components handle user input and display readiness results.
- API routes validate requests, apply auth checks, and return stable response shapes.
- Services combine weather, seasonal, species, confidence, and fallback logic.
- Repositories isolate external APIs and persistence.
- External data comes mainly from SMHI and ArtDatabanken.
- Drizzle/Postgres supports auth and feedback persistence.

## Integration-relevant parts

These files are most relevant when reviewing the project as an integration example:

- `lib/repositories/apiClient.ts`: shared fetch wrapper, headers, response parsing, HTTP errors, retry behavior, and logging hooks
- `lib/repositories/weatherDataRepository.ts`: SMHI station and weather-history integration
- `lib/repositories/seasonalObservationRepository.ts`: ArtDatabanken observation integration, API-key header, radius/lookback fallback, caching, and stale-if-error behavior
- `lib/services/weatherHistoryService.ts`: weather-history orchestration
- `lib/services/mushroomReadinessService.ts`: readiness scoring and confidence logic
- `app/api/mushroom-readiness/route.ts`: request validation, auth boundary, and API response contract

## Current-state diagrams

### Mushroom Mood

Implemented readiness flow: UI, API route, readiness service, species rules, SMHI weather history, ArtDatabanken seasonal evidence, in-memory cache, and static-calendar fallback.

![Current-state Mushroom Mood architecture](./uml/out/architecture/current/mushroom-mood.svg)

Source: [mushroom-mood.puml](./uml/architecture/current/mushroom-mood.puml)

### Nearest-station weather

Implemented flow for finding weather stations and reading historical weather data.

![Current-state nearest station weather architecture](./uml/out/architecture/current/nearest-station-weather.svg)

Source: [nearest-station-weather.puml](./uml/architecture/current/nearest-station-weather.puml)

### Beta access control

Implemented app-level beta access boundary: Auth.js magic-link sign-in, allowlists, guards, protected routes, and denied states.

![Current-state beta access control architecture](./uml/out/architecture/current/beta-access-control.svg)

Source: [beta-access-control.puml](./uml/architecture/current/beta-access-control.puml)

### Beta feedback persistence

Implemented feedback persistence foundation: API route, auth/beta checks, repository, Drizzle, and Postgres table.

![Current-state beta feedback architecture](./uml/out/architecture/current/beta-feedback.svg)

Source: [beta-feedback.puml](./uml/architecture/current/beta-feedback.puml)

## Target-state diagrams

Target-state diagrams describe planned or incomplete work. They are useful for planning, but current-state diagrams should match the code.

- [Mushroom Mood target](./uml/architecture/target/mushroom-mood.puml)
- [Nearest-station weather target](./uml/architecture/target/nearest-station-weather.puml)
- [Beta access control target](./uml/architecture/target/beta-access-control.puml)
- [Beta feedback target](./uml/architecture/target/beta-feedback.puml)

## Diagram rule

Keep current-state diagrams aligned with implemented behavior. Use target-state diagrams only for planned changes.
