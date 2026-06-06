# Current Work

Update this file before you ask an agent to continue work from repository context.

## Active feature

`beta-deployment-foundation`

## Stage

`review`

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

`manual-review-before-merge`

The implementation and independent review are complete. The owner is performing the final manual review before committing and merging the deployment-foundation slice.

## Primary files

### Durable docs

- Deployment doc: `docs/deployment.md`
- Environment variable template: `.env.example`
- Beta launch gate: `docs/plans/active/beta-launch-checklist.md`

### Final active review artifact

- Manual checklist: `docs/plans/active/beta-deployment-foundation-manual-review-checklist.md`

### Archived slice artifacts

The slice-specific plan, decision log, execution log, and independent review are already archived here:

- Plan: `docs/plans/archive/beta-deployment-foundation/beta-deployment-foundation-plan.md`
- Decision log: `docs/plans/archive/beta-deployment-foundation/beta-deployment-foundation-decision-log.md`
- Execution log: `docs/plans/archive/beta-deployment-foundation/beta-deployment-foundation-execution-log.md`
- Review: `docs/plans/archive/beta-deployment-foundation/beta-deployment-foundation-review.md`

## Expected next action

Perform the final owner manual review before commit and merge.

1. Review `docs/deployment.md` as durable current-state documentation.
2. Confirm it does not contain transient planning notes, stale active-slice references, or unnecessary click-by-click setup instructions.
3. Complete `docs/plans/active/beta-deployment-foundation-manual-review-checklist.md`.
4. Confirm `.env.example` is committed and contains variable names only.
5. Confirm local secret files remain ignored by Git.
6. Confirm the Vercel Preview/dev-live deployment works for owner-only testing.
7. Confirm `main`/Production is not publicly usable before app-level invite-only auth exists.
8. Confirm `npm test` and `npm run build` have passed for the merge candidate.
9. If manual review passes, commit the documentation cleanup and merge to `main`.
10. After merge, tag the accepted baseline if desired.
11. Then update `current-work.md` for the next slice, recommended: `beta-access-control`.

## Exact handoff question

Is the `beta-deployment-foundation` slice ready to commit and merge, with `docs/deployment.md` cleaned up as durable operational documentation, Vercel deployment behavior documented accurately for the free-tier Production/Preview model, required env vars documented safely, and no remaining blockers before moving to the `beta-access-control` slice?

## Stop condition for this stage

This review stage is complete when:

- The owner completes the manual review checklist.
- Any final documentation issues are fixed or accepted.
- The merge candidate is committed.
- The slice is merged to `main` or the owner explicitly decides not to merge yet.
- If merged, the accepted baseline commit is tagged or the tagging decision is recorded.
- `current-work.md` is updated to the next active slice after the deployment-foundation slice is closed.

## Constraints or notes

- This slice is deployment foundation only. It must not be treated as beta launch approval.
- Do not invite beta testers until app-level invite-only access is implemented in a later slice.
- `main`/Production must not be publicly usable before app-level invite-only auth exists.
- Keep `docs/deployment.md` durable and current-state oriented.
- Keep one-off setup details, execution notes, and review findings in the archived slice files, not in `docs/deployment.md`.
- Use Vercel Hobby/free built-in environments only for now:
  - Production = `main` = future beta baseline.
  - Preview = `dev`, PRs, and feature branches = owner-only live testing.
  - Development = local/Vercel CLI only.
- Use Vercel Environment Variables for deployed secrets.
- Use `.env.local` for local real values and keep it gitignored.
- Use `.env.example` for committed variable names only.
- Previously exposed or uncertain credentials have been rotated; final review should confirm deployed/local environments use rotated values.
- No new persistence is part of this slice.
- No feature-flow UML update is expected.
- Architecture docs/UML only need updates if this slice added a real runtime boundary, such as a health endpoint, config-validation module, or deployment-platform boundary.
- Next recommended slice: `beta-access-control`.
