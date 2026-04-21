# Mushroom Readiness Manual Review Checklist

Use this before commit after agent implementation and independent review.

## Scope and intent

- [ ] The implemented slice still matches the first-slice scope: spot selection, species selection, readiness lookup, and result rendering.
- [ ] No saved-spot persistence, species-management UI, or contributor workflow was added without an explicit decision.
- [ ] Remaining open questions about labels, confidence wording, or species set are documented.

## Docs and diagrams

- [ ] Feature-flow diagrams were updated if user-visible behavior changed from the planned flow.
- [ ] Architecture diagrams were updated if route, service, or repository boundaries changed from the planned target state.
- [ ] Plan, decision log, execution log, review file, and this checklist remain aligned with the implemented slice.

## Code quality

- [ ] The new route and service boundaries are understandable without hidden planning context.
- [ ] Any temporary in-memory catalog or placeholder integration is clearly limited to the first slice.
- [ ] Naming and file placement fit the existing Next.js and `lib/` structure.
- [ ] Any new dependency choice is documented in the decision log.

## Behavior and testing

- [ ] The slice covers success, validation, loading, error, and insufficient-data states.
- [ ] Route and service tests were added or updated.
- [ ] Manual UI checks were done for spot entry, species selection, and result rendering.
- [ ] Test commands and outcomes were recorded in the execution log.

## Review and commit readiness

- [ ] An independent review pass was completed.
- [ ] Review findings were addressed or explicitly accepted as follow-up items.
- [ ] The implementation is ready to serve as the base for later saved-spot, evidence-view, and admin features.
- [ ] The change is ready for a manual commit.