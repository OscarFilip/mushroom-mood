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

## Context tiers for this stage

### Read immediately

- Repository instructions: `AGENTS.md`
- Current handoff: `docs/plans/active/current-work.md`
- Plan: `docs/plans/active/<feature-name>-plan.md`
- Decision log: `docs/plans/active/<feature-name>-decision-log.md`

### Read only when changing or validating that area

- Durable docs: `<exact durable docs for this stage>`
- Tests: `<exact test files or directories for this stage>`
- Implementation files: `<exact files or search targets for this stage>`
- Diagrams: `<exact .puml source files for this stage>`

### Update during work

- Execution log: `docs/plans/active/<feature-name>-execution-log.md`
- Review: `docs/plans/active/<feature-name>-review.md`
- Manual checklist: `docs/plans/active/<feature-name>-manual-review-checklist.md`

### Do not read unless directly relevant

- Archived plans and historical logs under `docs/plans/archive/`
- Generated diagrams under `docs/uml/out/`
- Lock files, dependency directories, build output, and coverage output
- Unrelated feature files and durable docs not touched by this stage

## Expected next action

Describe the next concrete action for the current owner.

Do not leave this blank if you want minimal-prompt continuation.

## Exact handoff question

State the precise question the next agent or person should answer.

## Stop condition for this stage

State what must be true before the stage changes.

## Constraints or notes

- List feature or implementation constraints here.
- Token/credit efficiency: read `AGENTS.md`, this file, and the active plan/decision log first. Inspect other files only when they are directly needed for the current stage or handoff question.
- Prefer targeted searches and excerpts before opening full files. Avoid generated outputs, archives, dependency directories, and build artifacts unless directly relevant.