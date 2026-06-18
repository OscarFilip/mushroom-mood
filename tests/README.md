# Testing Guide

This project uses Jest for unit and integration-style tests.

The goal is to protect Mushroom Mood from misleading readiness results, broken integrations, and access-control regressions. For the overall definition of done and minimum test bar, see [Done and testing](../docs/done-and-testing.md).

## Commands

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:ci
```

Run one area while developing:

```bash
npm test -- apiClient
npm test -- tests/lib/repositories/weatherDataRepository.test.ts
npm test -- --testNamePattern="returns mapped weather data"
```

## Test layout

```text
tests/
  app/                 route and auth behavior
  lib/                 services, repositories, models, utils
  helpers/             shared test helpers
  setup.ts             global test setup
```

Keep new tests close to the behavior they protect. Add or update tests when implementation changes affect user-visible results, API responses, persistence, auth boundaries, external API handling, or confidence/readiness calculations.

## Testing expectations

Use unit tests for isolated logic:

- validation
- calculations and branching logic
- mapping and transformation
- scoring and confidence logic
- small model and view-model shaping

Use integration-style tests when behavior crosses a boundary:

- API route to service
- service to repository
- repository to mocked external API
- auth guard to route response
- repository to database boundary

Each implemented backend flow should usually have:

- one happy-path test
- one invalid-input test
- one failure, empty-result, or degraded-state test

Coverage is useful, but it is not the goal by itself. Prefer tests that prove meaningful product behavior over tests that only execute lines.

## Project coverage priorities

Prioritize tests around:

- request validation
- auth and allowlist behavior
- direct API and direct URL access boundaries
- external API error handling
- retry and no-retry behavior in the API client
- SMHI weather data parsing and mapping
- ArtDatabanken observation mapping, caching, fallback, and stale-if-error behavior
- readiness score, confidence, evidence, and limitations
- feedback persistence behavior

## Mocking boundaries

External services should be mocked. Tests must not depend on live SMHI, ArtDatabanken, email, Auth.js provider, or deployed database availability unless a task explicitly calls for a manual deployed-environment check.

Mock at the boundary that keeps the test focused. Repository tests can mock `fetch`; service tests can mock repositories; route tests can mock auth and service behavior. Reset mocks between tests.

Assert the behavior that matters to the app, not incidental implementation details that make refactoring harder.

## AI agent guidance

When adding or changing tests, agents should:

- read nearby tests before choosing a pattern
- keep tests scoped to the behavior changed by the task
- prefer behavior-focused test names and assertions
- avoid live network calls and live secrets
- reset mocks and module state between tests when needed
- freeze system time for month-sensitive or season-sensitive behavior
- cover degraded external responses, sparse data, and unexpected response shapes
- update tests alongside implementation changes instead of leaving TODO coverage notes
- run focused tests first, then the broader suite when the change has meaningful risk

Do not add broad snapshot tests or coverage-only assertions unless they protect a stable contract. Do not introduce new test dependencies without recording the reason in the relevant decision log for non-trivial work.

## Test helpers

Use helpers from [testHelpers.ts](./helpers/testHelpers.ts) when they make setup clearer and keep fixtures consistent.

```typescript
import { createMockWeatherStation, testCoordinates } from '@/tests/helpers/testHelpers';

it('uses shared weather-station fixtures', () => {
  const station = createMockWeatherStation({ name: 'Test Station' });
  const coords = testCoordinates.newYork;

  expect(station.name).toBe('Test Station');
  expect(coords).toMatchObject({ latitude: expect.any(Number), longitude: expect.any(Number) });
});
```

## Debugging failed tests

Use focused runs first:

```bash
npm test -- seasonalObservationRepository
npm test -- --runInBand
```

For difficult failures, inspect the failing expectation and any mocked inputs. Temporary logging is fine while debugging, but remove it before committing.