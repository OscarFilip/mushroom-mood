# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`mushroom-readiness`

## Stage

`implementation`

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

Implement the first mushroom-readiness slice in the app. Build the start-page spot input, the first curated species selector, a readiness API route, a readiness service, and result rendering with loading, validation, error, and insufficient-data states.

Do not leave this blank if you want minimal-prompt continuation.

## Constraints or notes

- Use readiness label plus probability and separate confidence as the output model.
- Keep precipitation windows at 3, 7, 14, and 30 days.
- Treat seasonal state separately from readiness label.
- Treat saved spot status as user organization only, not a probability factor.
- Keep expert-input and admin algorithm-adjustment as planned features, but defer detailed workflow design.
- First curated species set: `boletus-edulis`, `boletus-reticulatus`, `cantharellus-cibarius`, `craterellus-tubaeformis`.
- Initial readiness labels: `very-likely-worth-checking`, `worth-checking`, `possible-but-uncertain`, `unlikely-now`, `very-unlikely-right-now`, `unknown`.