# Plans

This folder holds planning and execution files for feature work.

These files are project records for people first. Agents can use them too, but agent-specific workflow rules belong in the root `AGENTS.md` file.

## Structure

- `active/`: current feature work and in-progress implementation files
- `archive/`: completed plans that are no longer active
- `_templates/`: reusable templates for plans, logs, and reviews

## Recommended file set per feature

Create these files in `active/` for each non-trivial feature:

- `current-work.md`
- `<feature-name>-plan.md`
- `<feature-name>-decision-log.md`
- `<feature-name>-execution-log.md`
- `<feature-name>-review.md`

Optional supporting files:

- `<feature-name>-open-questions.md`
- `<feature-name>-notes.md`
- `<feature-name>-manual-review-checklist.md`

## Suggested workflow

1. Update `current-work.md` with the active feature and current stage.
2. Create a plan from the implementation-plan template.
3. Update diagrams in `docs/uml/` if the user flow or architecture changes.
4. Keep the decision log up to date during planning and implementation.
5. Keep the execution log up to date during implementation and testing.
6. Run an independent review and save it in the review file.
7. Use a manual review checklist before commit.
8. Move completed artifacts to `archive/` when the feature is stable.

## Human and agent use

- `AGENTS.md` is mainly for agent behavior and workflow rules.
- `current-work.md` is the handoff file that lets an agent continue with little prompting.
- Plan, log, review, and checklist files are shared artifacts for humans and agents.
- Template files in `_templates/` support those shared artifacts.