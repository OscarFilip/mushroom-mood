# Active Plans

This folder contains the files for the feature that is now in planning, implementation, or review.

## Minimal-prompt workflow

To let an agent continue with little prompting:

1. Update `current-work.md` using `_templates/current-work-template.md` when needed.
2. Make sure the referenced feature files exist.
3. Start the agent in the repository root.
4. Tell it to continue from `AGENTS.md` and `docs/plans/active/current-work.md`.

If `current-work.md` still contains placeholders, the agent should stop and ask instead of guessing the scope.

When work moves between planning, implementation, self-check, independent review, and targeted re-review, keep `current-work.md` current so the next handoff is scoped and explicit.


## Token-efficient handoff

Keep `current-work.md` narrow enough that an agent can start without scanning the whole repository. Prefer context tiers over one broad file list: `Read immediately`, `Read only when changing or validating that area`, `Update during work`, and `Do not read unless directly relevant`.

Name exact plan, decision log, execution log, review file, tests, durable docs, and UML source files only in the tier where they are needed for the current stage. Do not list generated diagram outputs, archives, dependency directories, build artifacts, or unrelated feature files unless the next handoff really needs them.

## Expected contents

- `current-work.md`
- `<feature-name>-plan.md`
- `<feature-name>-decision-log.md`
- `<feature-name>-execution-log.md`
- `<feature-name>-review.md`
- `<feature-name>-manual-review-checklist.md` when needed
## Relationship to durable docs

Files in this folder are temporary active-slice handoff files. When a slice is complete, archive the slice-specific plan, decision log, execution log, review file, and checklist according to the project archive process.

Durable product and operational docs outside `docs/plans/active/`, such as `docs/deployment.md`, are not archived with the slice. Keep those files as current-state documentation and remove stale active-slice references from them before handoff.

