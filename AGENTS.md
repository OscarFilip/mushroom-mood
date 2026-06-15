# AGENTS

This repository supports agent-assisted planning, documentation, implementation, testing, and review.

## Working principles

- Follow the existing repo structure unless there is a clear reason to change it.
- Prefer small, focused changes over broad refactors.
- Keep docs, diagrams, tests, and implementation aligned.
- Do not introduce dependencies without a short justification in the decision log.
- Do not remove or overwrite user-authored work unless the task explicitly requires it.


## Token and credit efficiency

- Start from `AGENTS.md` and `docs/plans/active/current-work.md`, then follow the context tiers for the current stage.
- Read the `Read immediately` tier first. Open `Read only when changing or validating that area` files only after the active plan, decision log, targeted search results, or failing checks make them relevant.
- Prefer targeted searches, file names, headings, and small excerpts before opening full files.
- Avoid broad repository scans unless the task explicitly asks for a full audit or the active plan requires it.
- Do not inspect generated files such as `docs/uml/out/*.svg` unless debugging generated output. Use `.puml` files as the source of truth.
- Do not read archived plans, historical logs, lock files, build output, coverage output, or dependency directories unless directly relevant.
- Reuse a short context summary instead of repeatedly rereading the same files in one work session.
- Before expanding scope to additional durable docs, tests, migrations, or implementation areas, confirm that the active plan or current task requires them.
- For large implementation or review tasks, keep the scope tied to the handoff question and stop once the stop condition can be answered.
- If `current-work.md` points to many unrelated files or appears stale, ask for clarification instead of spending credits exploring the whole repo.

## Required workflow artifacts for non-trivial work

For any feature or larger change, create or update files in `docs/plans/active/`:

- `current-work.md`
- `<feature-name>-plan.md`
- `<feature-name>-decision-log.md`
- `<feature-name>-execution-log.md`
- `<feature-name>-review.md`

Optional but recommended before commit:

- `<feature-name>-manual-review-checklist.md`

Use the templates in `docs/plans/_templates/` as the starting point.

## Planning expectations

- Capture scope, acceptance criteria, risks, and open questions before implementation.
- When working in a planning-first mode, prefer creating or updating PlantUML diagrams before implementation so behavior and technical boundaries are clear first.
- If a feature has user-visible behavior, update or add feature-flow diagrams in `docs/uml/`.
- If a feature changes technical boundaries or responsibilities, update or add architecture diagrams in `docs/uml/`.
- Treat the `.puml` files as the editable source of truth for planning diagrams.
- Read `docs/plans/active/current-work.md` first to determine the active feature, current stage, and expected next action.

## Decision log expectations

- Record meaningful choices as they happen.
- Explain why a choice was made and what alternatives were rejected.
- Record dependency choices, data-shape decisions, state-management decisions, and test-strategy decisions.

## Execution log expectations

- Record major file changes.
- Record commands and tests that were run.
- Record failures, blockers, and how they were resolved.
- End with a short summary of remaining risks or open items.

## Review expectations

- Review for bugs, regressions, missing tests, and architecture drift.
- Compare the resulting changes against the approved plan.
- Flag unnecessary complexity and undocumented assumptions.
- Use the manual review checklist before commit when the change is non-trivial.

## Minimal-prompt operating mode

- Prefer repository-driven execution over repeated user prompting.
- After the user sets the active feature and stage, use `docs/plans/active/current-work.md` and its context tiers as the main operating context.
- If `current-work.md` still contains placeholder values such as `<feature-name>`, lacks context tiers, or lacks a concrete next action, stop and ask for clarification instead of guessing.
- If the stage is `planning`, work on diagrams and planning artifacts, not implementation.
- If the stage is `implementation`, implement only from the approved plan and keep logs updated.
- If the stage is `review`, perform review only and write findings to the review file.

## Repo-specific notes

- Product-flow docs live in `docs/feature-flows.md` and use `docs/uml/feature-*.puml`.
- Architecture docs live in `docs/architecture.md` and use separate current-state and target-state diagrams where useful.
- Generated diagram outputs live in `docs/uml/out/`, but `.puml` files are the source of truth.
- Tests live under `tests/` and should be updated with implementation changes when behavior changes.