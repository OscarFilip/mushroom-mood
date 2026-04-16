# <feature-name> Manual Review Checklist

Use this before commit after agent implementation and independent review.

## Scope and intent

- [ ] The change still matches the intended feature scope.
- [ ] No unrelated files or refactors were introduced without a reason.
- [ ] Any remaining open questions are documented.

## Docs and diagrams

- [ ] Feature-flow diagrams were updated if user-visible behavior changed.
- [ ] Architecture diagrams were updated if responsibilities or boundaries changed.
- [ ] Plan, decision log, execution log, and review file are present for non-trivial work.

## Code quality

- [ ] The code is understandable without relying on hidden agent reasoning.
- [ ] New abstractions are justified and not premature.
- [ ] Dependencies added or changed are documented in the decision log.
- [ ] Naming, file placement, and structure fit the repo.

## Behavior and testing

- [ ] The implementation appears to satisfy the acceptance criteria.
- [ ] Error handling and empty states were considered where relevant.
- [ ] Relevant tests were added or updated.
- [ ] Relevant tests were run and the results were recorded.

## Review and commit readiness

- [ ] An independent review was completed by a different model or a separate pass.
- [ ] Review findings were addressed or explicitly accepted as follow-up items.
- [ ] I understand the key technical choices well enough to explain them.
- [ ] The change is ready for a manual commit.