# Done and Testing

This document defines what "done" means for Mushroom Mood and the minimum test bar for feature work.

## Definition of done

A flow is done when:

- the main user path works end to end
- important error and empty states are handled
- user input is validated
- related docs and diagrams match the implementation
- tests cover the important behavior
- `npm test` passes
- `npm run build` passes
- no obvious placeholder branches, commented-out production code, or known broken states remain

## Test strategy

Use a light test pyramid.

### Unit tests

Use unit tests for fast, isolated behavior:

- validation rules
- calculations
- mapping and transformation logic
- branching logic with clear inputs and outputs

### Integration-style tests

Use integration-style tests when multiple parts need to work together:

- route-to-service behavior
- service-to-repository behavior
- mocked external API behavior
- persistence boundaries
- error handling across layers

Each implemented backend flow should have at least:

- one happy-path test
- one invalid-input test
- one failure, empty-result, or degraded-state test

### End-to-end tests

End-to-end tests are optional for now.

For the current beta stage, prioritize useful unit tests, integration-style tests, and manual deployed-environment smoke checks.

## Access-control test bar

Access control is a server-side boundary. Link hiding or happy-path UI checks are not enough.

Access-control work should cover:

- allowlist parsing and normalized email comparison
- logged-out visitor rejection
- authenticated but non-invited user rejection
- invited beta-user access
- beta-user rejection from restricted/admin checks
- admin/restricted access when a restricted surface exists
- direct URL and direct API access
- feedback persistence when feedback storage is part of the slice

Manual deployed-environment checks are required before access control counts as beta-ready, because Auth.js, Resend, Postgres, and deployment configuration cannot be fully proven by local unit tests.
