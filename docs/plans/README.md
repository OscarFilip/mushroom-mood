# Plans

This folder holds planning and execution artifacts for feature work.

These files are intended to be human-readable project records. Agents may use them during planning and implementation, but agent-specific operating rules belong in the repository root `AGENTS.md`.

## Structure

- `active/`: current feature work and in-progress implementation artifacts.
- `archive/`: completed plans that are no longer active.
- `_templates/`: reusable templates for plans, logs, and reviews.

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
3. Update diagrams in `docs/uml/` if user flow or architecture is affected.
4. Keep the decision log updated during planning and implementation.
5. Keep the execution log updated during implementation and testing.
6. Run an independent review and save the output in the review file.
7. Run through a manual review checklist before commit.
8. Move completed artifacts to `archive/` when the feature is stable.

## Human versus agent use

- `AGENTS.md` is primarily for agent behavior and workflow rules.
- `current-work.md` is the handoff file that lets an agent continue with minimal prompting.
- Plan, log, review, and checklist files are shared artifacts for both humans and agents.
- Template files in `_templates/` are mainly for the shared work artifacts, not for repeated prompting.