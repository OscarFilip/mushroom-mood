# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`beta-access-control`

## Stage

`done`

Allowed values:

- `planning`
- `implementation`
- `review`
- `done`

## Current owner

`human`

Examples:

- `planning-agent`
- `implementation-agent`
- `review-agent`
- `human`

## Current review round

`3-complete`

## Context tiers for this stage

### Read immediately

- Repository instructions: `AGENTS.md`
- Current handoff: `docs/plans/active/current-work.md`
- Beta launch gate: `docs/plans/active/beta-launch-checklist.md`

### Read only when changing or validating that area

- Deployment doc: `docs/deployment.md`
- Feature flows: `docs/feature-flows.md`
- Architecture: `docs/architecture.md`
- Definition of done and testing: `docs/done-and-testing.md`
- Environment variable template: `.env.example`
- Completed slice plan: `docs/plans/active/beta-access-control-plan.md`
- Completed slice decision log: `docs/plans/active/beta-access-control-decision-log.md`
- Completed slice execution log: `docs/plans/active/beta-access-control-execution-log.md`
- Completed slice manual checklist: `docs/plans/active/beta-access-control-manual-review-checklist.md`
- Completed slice review handoff: `docs/plans/active/beta-access-control-review.md`
- Current feature flow source: `docs/uml/feature/current/beta-access-control.puml`
- Current architecture sources: `docs/uml/architecture/current/beta-access-control.puml`, `docs/uml/architecture/current/beta-feedback.puml`
- Future-difference architecture sources: `docs/uml/architecture/target/beta-access-control.puml`, `docs/uml/architecture/target/beta-feedback.puml`

### Update during implementation

- Execution log: `docs/plans/active/beta-access-control-execution-log.md`
- Manual checklist: `docs/plans/active/beta-access-control-manual-review-checklist.md`
- Review handoff: `docs/plans/active/beta-access-control-review.md`

### Do not read unless directly relevant

- Archived plans and historical logs under `docs/plans/archive/`
- Generated diagrams under `docs/uml/out/`
- Lock files, dependency directories, build output, and coverage output
- Unrelated feature files and durable docs not touched by the approved slice

## Expected next action

Treat `beta-access-control` as complete and choose the next beta-blocking slice.

1. Use `beta-launch-checklist.md` to pick the next active slice from the remaining P0 or P1 items.
2. Update this file before asking an agent to continue, so the next task starts from the correct plan/checklist context instead of reopening `beta-access-control` by default.
3. Reopen `beta-access-control` only if a concrete defect is found in later deployment or beta use.

## Exact handoff question

Which next beta-blocking slice should become the active feature after the completed `beta-access-control` foundation?

## Stop condition for this stage

This stage is already complete. Before the next agent task:

- select the next active slice from the beta launch checklist
- update this handoff to that new slice
- keep `beta-access-control` closed unless a new defect is found

## Constraints or notes

- Planning decisions are complete; do not re-open product scope without a new owner decision.
- Keep this slice focused on beta access control, Auth.js persistence, and the minimal feedback persistence foundation decided for beta.
- Do not implement public signup, self-service invite management, saved spots, public marketing pages, advanced admin tooling, feedback review UI, automatic recalibration, or species-management editing in this slice.
- The current repo state is understood to have no implemented restricted/admin species-management surface. Add reusable admin policy/guard support and protect any restricted surface that exists at implementation time, but do not invent a new admin UI just to test the policy.
- Manual validation identities and production/preview secret values are operational setup work and must not be committed.
- Token/credit efficiency for this implementation stage is defined by the context tiers above. Start with **Read immediately**, then expand only when the active plan, decision log, targeted search results, or failing checks make another file relevant.
- Prefer targeted searches and small excerpts before opening full files. Do not inspect generated SVG files in `docs/uml/out/` unless the task is specifically to debug rendered diagram output.
- Do not read archived plans or unrelated feature files unless the active plan, decision log, or current implementation error explicitly references them.

