# Current Work

Update this file before asking an agent to continue work from repository context.

## Active feature

`mushroom-readiness`

## Stage

`planning`

Allowed values:

- `planning`
- `implementation`
- `review`

## Primary files

- Plan: `docs/plans/active/mushroom-readiness-plan.md`
- Decision log: `docs/plans/active/mushroom-readiness-decision-log.md`
- Execution log: `docs/plans/active/mushroom-readiness-execution-log.md`
- Review: `docs/plans/active/mushroom-readiness-review.md`
- Manual checklist: `docs/plans/active/mushroom-readiness-manual-review-checklist.md`

## Expected next action

Overall product and target-architecture planning is complete enough for a checkpoint commit. Next, decide the first implementation slice and continue with feature-specific planning around spot and species selection, readiness lookup, and transparent result rendering.

Do not leave this blank if you want minimal-prompt continuation.

## Constraints or notes

- Use readiness label plus probability and separate confidence as the output model.
- Keep precipitation windows at 3, 7, 14, and 30 days.
- Treat seasonal state separately from readiness label.
- Treat saved spot status as user organization only, not a probability factor.
- Keep expert-input and admin algorithm-adjustment as planned features, but defer detailed workflow design.