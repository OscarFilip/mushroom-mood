# Active Plans

This folder contains the files for the feature currently being planned, implemented, or reviewed.

## Minimal-prompt workflow

To let an agent continue with minimal prompting:

1. Update `current-work.md`
2. Make sure the referenced feature files exist
3. Start the agent in the repository root
4. Tell it only to continue from `AGENTS.md` and `docs/plans/active/current-work.md`

If `current-work.md` still contains placeholders, the agent should stop and ask instead of inventing scope.

## Expected contents

- `current-work.md`
- `<feature-name>-plan.md`
- `<feature-name>-decision-log.md`
- `<feature-name>-execution-log.md`
- `<feature-name>-review.md`
- `<feature-name>-manual-review-checklist.md` when needed