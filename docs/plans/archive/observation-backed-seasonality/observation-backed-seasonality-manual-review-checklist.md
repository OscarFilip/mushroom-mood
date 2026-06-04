# Observation-Backed Seasonality Manual Review Checklist

Use this before commit after implementation and an independent review.

## Scope and intent

- [x] The change still matches the intended feature scope.
- [x] The final diff still matches the planned slice boundary.
- [x] No unrelated files or refactors were introduced without a reason.
- [x] Any remaining open questions are documented.

## Docs and diagrams

- [x] Feature-flow diagrams were updated if user-visible behavior changed.
- [x] Architecture diagrams were updated if responsibilities or boundaries changed.
- [x] Plan, decision log, execution log, and review file are present for non-trivial work.

## Code quality

- [ ] The code is understandable without relying on hidden agent context.
- [ ] New abstractions are justified and not premature.
- [ ] Dependencies added or changed are documented in the decision log.
- [ ] Naming, file placement, and structure fit the repo.

## Behavior and testing

- [x] The implementation appears to satisfy the acceptance criteria.
- [x] Error handling and empty states were considered where relevant.
- [x] Relevant tests were added or updated.
- [x] Relevant tests were run and the results were recorded.

## Review and commit readiness

- [x] An independent review was completed by a different model or a separate pass.
- [x] The latest review findings were triaged, not blindly applied.
- [x] Review findings were addressed or explicitly accepted as follow-up items.
- [x] Any re-review after fixes was targeted to changed or previously risky areas.
- [x] I understand the key technical choices well enough to explain them.
- [ ] The change is ready for a manual commit.