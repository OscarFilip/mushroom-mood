# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`none`


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
- `complete`

## Primary files

- Plan: `n/a`
- Decision log: `n/a`
- Execution log: `n/a`
- Review: `n/a`
- Manual checklist: `n/a`

## Expected next action

Choose the next feature to activate and create or restore its planning files in `docs/plans/active/`.

## Stop condition for this stage

`current-work.md` is updated with a concrete next feature, stage, owner, primary files, and next action.

## Exact handoff question

What feature should become active next?

## Constraints or notes

- The completed `observation-backed-seasonality` artifacts should live under `docs/plans/archive/observation-backed-seasonality/`.
- Update this file before starting the next feature so minimal-prompt continuation stays accurate.