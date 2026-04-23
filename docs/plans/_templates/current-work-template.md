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

`planning-agent`

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

Describe the next concrete action for the current owner.

Do not leave this blank if you want minimal-prompt continuation.

## Exact handoff question

State the precise question the next agent or person should answer.

## Stop condition for this stage

State what must be true before the stage changes.

## Constraints or notes

- List feature or implementation constraints here.