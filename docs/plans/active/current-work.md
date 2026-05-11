# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`<feature-name>`

## Stage

`planning`

Allowed values:

- `planning`
- `implementation`
- `review`

## Current owner

`human`

Examples:

- `planning-agent`
- `implementation-agent`
- `review-agent`
- `human`

## Current review round

`not-started`

Examples:

- `not-started`
- `self-check-1`
- `independent-review-1`
- `targeted-rereview-1`

## Primary files

- Plan: `docs/plans/active/<feature-name>-plan.md`
- Decision log: `docs/plans/active/<feature-name>-decision-log.md`
- Execution log: `docs/plans/active/<feature-name>-execution-log.md`
- Review: `docs/plans/active/<feature-name>-review.md`
- Manual checklist: `docs/plans/active/<feature-name>-manual-review-checklist.md`

## Expected next action

Set the next active feature and replace the placeholder file references before asking an agent to continue from repository context.

Do not leave this blank if you want minimal-prompt continuation.

## Exact handoff question

What is the next feature or task that should become the active work item?

## Stop condition for this stage

The next active feature, stage, owner, and primary files are filled in with concrete values.

## Constraints or notes

- Reset to a neutral handoff state after the mushroom-readiness slice reached commit readiness.
- Update this file before starting the next non-trivial feature.