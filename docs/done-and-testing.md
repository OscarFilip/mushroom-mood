# Done And Testing

This note defines what done means in this project and the minimum test bar for each feature flow.

## Definition of done

A flow is done when all of these are true:

- The main user path works end to end.
- Important error and empty states are handled.
- Input validation is in place where the flow accepts user input.
- The related feature-flow and architecture diagrams match the implementation.
- Tests cover the important behavior in the flow.
- `npm test` passes.
- `npm run build` passes.
- No obvious placeholder branches, commented-out production code, or known broken states remain in the flow.

## Minimum test strategy

Use a light test pyramid.

### 1. Unit tests for pure logic

Use unit tests when the behavior is fast, isolated, and easy to verify without wiring together multiple parts of the app.

Typical cases:

- validation rules
- calculations and comparisons
- mapping or transformation logic
- branching logic with clear inputs and outputs

### 2. Integration tests for the main backend flow

Use integration tests when the goal is to verify that multiple parts work together.

Typical cases:

- route-to-service behavior
- service-to-repository behavior
- error handling across layer boundaries
- flows that depend on mocked external APIs or persistence layers

Each implemented flow should have at least:

- one happy-path integration test
- one invalid-input test
- one failure or empty-result test

### 3. End-to-end tests are optional for now

End-to-end tests may come later.

For now, focus on strong unit tests and a small set of useful integration tests.