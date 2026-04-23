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

## Expected contents

- `current-work.md`
- `<feature-name>-plan.md`
- `<feature-name>-decision-log.md`
- `<feature-name>-execution-log.md`
- `<feature-name>-review.md`
- `<feature-name>-manual-review-checklist.md` when needed