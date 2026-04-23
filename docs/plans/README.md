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
5. Keep the execution log up to date during implementation, testing, and review-fix handoffs.
6. Run an implementer self-check before handing off to an independent review.
7. Save review rounds and targeted re-reviews in the review file instead of restarting review context each time.
8. Use a manual review checklist before commit.
9. Move completed artifacts to `archive/` when the feature is stable.

## Human and agent use

- `AGENTS.md` is mainly for agent behavior and workflow rules.
- `current-work.md` is the handoff file that lets an agent continue with little prompting.
- Plan, log, review, and checklist files are shared artifacts for humans and agents.
- Template files in `_templates/` support those shared artifacts.

## Template notes

- Use `_templates/current-work-template.md` when creating or resetting `active/current-work.md`.
- The plan template includes slice boundaries, review strategy, and handoff exit criteria.
- The execution log template includes reviewer handoffs, findings-in-scope, and post-fix validation.
- The review template supports multiple review rounds with explicit finding status and blocking vs non-blocking outcomes.