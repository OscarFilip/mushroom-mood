# Done And Testing

This note defines what “done” means for this project and what minimum testing level is expected before a feature flow is considered complete.

## Definition of done

A flow is considered done when all of the following are true:

- The main user path works end to end.
- Important error and empty states are handled.
- Input validation is in place where the flow accepts user input.
- The related feature flow and architecture flow diagrams match the implementation.
- Tests cover the important behavior for the flow.
- `npm test` passes.
- `npm run build` passes.
- There are no obvious placeholder branches, commented-out production code, or known broken states left in the flow.

## Minimum test strategy

This repository should use a lightweight test pyramid.

### 1. Unit tests are required for pure logic

Use unit tests when the behavior is fast, isolated, and can be checked without wiring together multiple parts of the app.

Typical scenarios:

- validation rules
- calculations and comparisons
- mapping or transformation logic
- branching logic with clear inputs and outputs

### 2. Integration tests are required for the main backend flow

Use integration tests when the value comes from verifying that multiple parts work together correctly.

Typical scenarios:

- route-to-service behavior
- service-to-repository behavior
- error handling across layer boundaries
- flows that depend on mocked external APIs or persistence layers

Each implemented flow should have at least:

- one happy-path integration test
- one invalid-input test
- one failure or empty-result test

### 3. End-to-end tests are optional for now

End-to-end testing might come into picture later on.

For now, the focus should stay on strong unit tests and a small number of valuable integration tests.