# beta-deployment-foundation Implementation Plan

## Summary

Create a private, low-cost deployment foundation for Mushroom Mood using GitHub and Vercel.

This slice should make it possible to test the current app in a realistic deployed environment before beta users are invited. It should provide two deployment paths:

- `dev` branch → protected owner-only dev-live environment for live testing changes.
- `main` branch → future beta baseline environment for testers, only after app-level invite-only access exists.

Deployment foundation is not the same as beta launch. This slice prepares the infrastructure needed for later beta work.

## Slice boundary

- This slice includes:
  - Choosing and documenting the first deployment provider.
  - Connecting the project to Vercel through GitHub.
  - Establishing `dev` as the owner-only deployed test environment.
  - Establishing `main` as the future beta baseline branch.
  - Documenting environment variable handling.
  - Using Vercel Environment Variables for deployed secrets.
  - Adding or updating `.env.example` with required variable names only.
  - Adding or updating `docs/deployment.md`.
  - Verifying `npm test` and `npm run build` before accepting the deployed baseline.
  - Documenting rollback and disable-beta procedures.
  - Ensuring missing critical external API credentials do not produce normal-looking readiness results.
- This slice does not include:
  - App-level login/sign-in.
  - App-level invite-only access.
  - Role checks or admin route protection.
  - Feedback persistence.
  - Feedback review UI.
  - Public signup.
  - Saved spots.
  - New database/storage setup unless already required by the existing app.
  - Automatic score recalibration.
  - Final scoring/factor tuning.
- Review this slice against:
  - `docs/plans/active/beta-launch-checklist.md`
  - `docs/plans/active/current-work.md`
  - `docs/plans/active/beta-deployment-foundation-decision-log.md`
  - `docs/deployment.md`
  - `.env.example`

## Goal

Mushroom Mood can be deployed privately and safely enough that the rest of the beta launch work can be tested in a production-like setting.

Success means the app can be deployed from GitHub to Vercel, the owner can test `dev` changes in a protected live environment, `main` can serve as the future beta baseline, secrets are not committed, and there is a clear rollback/disable path.

## Scope

- In scope:
  - Vercel project setup.
  - GitHub integration.
  - `dev` and `main` deployment mapping.
  - Environment variable documentation.
  - Vercel Environment Variables setup.
  - External API config validation expectations.
  - Build/test verification.
  - Rollback/disable-beta documentation.
- In scope:
  - Lightweight code changes only if needed to prevent misleading readiness results when required external API configuration is missing.
  - Optional health/config validation endpoint if it is small and useful for deployment validation.
- Out of scope:
  - Full auth implementation.
  - Invite list storage.
  - Feedback storage.
  - Persistent beta user data.
  - Major architecture rewrites.
  - Changing scoring behavior beyond controlled config/dependency failure handling.

## Context

Relevant existing docs and areas:

- `docs/plans/active/beta-launch-checklist.md`
- `docs/plans/active/current-work.md`
- `docs/architecture.md`
- `docs/feature-flows.md`
- `docs/done-and-testing.md`
- `docs/seasonal-observation-policy.md`
- `docs/uml/architecture-mushroom-mood.puml`
- `docs/uml/architecture-mushroom-mood-target.puml`
- `docs/uml/feature-mushroom-probability.puml`

Planning decisions already made:

- Use Vercel as the first deployment provider unless a blocking limitation appears.
- Keep GitHub as the source of truth for code, docs, branches, PRs, and checks.
- Use Vercel for hosting, deployment URLs, runtime environment variables, deployment protection, and rollback.
- Use Vercel Environment Variables for deployed secrets.
- Use `.env.example` as the committed source of truth for required environment variable names.
- Use local `.env.local` for local real values and keep it gitignored.
- Do not add an external secret manager for the first beta.
- Previously exposed or uncertain credentials have been rotated.
- No new persistence belongs to this slice.

## Acceptance criteria

- [ ] Vercel is selected as the initial deployment provider unless a blocker is documented.
- [ ] GitHub remains the source of truth for code, docs, branches, PRs, and checks.
- [ ] Vercel is connected to the GitHub repository.
- [ ] `main` is the production/beta-baseline branch in Vercel.
- [ ] `dev` can produce a protected owner-only preview/dev-live deployment.
- [ ] The `dev` deployment is not usable by arbitrary visitors.
- [ ] The future beta environment is not treated as tester-ready until app-level invite-only access exists.
- [ ] Required environment variable names are documented in `.env.example` without real values.
- [ ] Real deployed secrets are stored in Vercel Environment Variables, not committed files.
- [ ] Local real values live only in local `.env.local` or equivalent ignored local config.
- [ ] Any `NEXT_PUBLIC_` variable is confirmed safe for browser exposure.
- [ ] Rotated credentials are used locally and in Vercel.
- [ ] Missing required external API credentials do not produce normal-looking readiness results.
- [ ] External API failure behavior is controlled and understandable enough for deployment validation.
- [ ] `npm test` passes before accepting the deployment baseline.
- [ ] `npm run build` passes locally and in the deployment path before accepting the deployment baseline.
- [ ] Build-time, startup, and runtime errors are visible through provider logs or app responses.
- [ ] Rollback and disable-beta procedures are documented in `docs/deployment.md`.
- [ ] Accepted baseline commit is tagged.
- [ ] Deployment foundation is explicitly recorded as not equal to beta launch approval.

## Handoff readiness for implementation

- Code paths expected to change:
  - `.env.example`
  - `docs/deployment.md`
  - Potential config/env validation helper if missing.
  - Potential readiness API error handling if missing required config currently produces misleading results.
  - Potential lightweight health/config endpoint if useful for deployment validation.
- Required tests or checks before review handoff:
  - `npm test`
  - `npm run build`
  - Manual verification of deployed `dev` preview/dev-live environment.
  - Manual verification that missing critical API config blocks normal readiness output.
- Known risks to call out to the reviewer:
  - Accidentally exposing secrets through `NEXT_PUBLIC_` variables.
  - Treating a deployed environment as beta-ready before auth exists.
  - Relying on obscure deployment URLs as protection.
  - Letting missing external API credentials produce plausible but misleading readiness results.
  - Forgetting that rollback may not fix bad or stale environment variables.

## Proposed approach

### User flow impact

No intentional user-flow changes are part of this slice.

The only acceptable user-visible behavior change is a safer error/degraded state when readiness cannot be calculated because required external API configuration or dependencies are missing.

No feature-flow UML update is expected unless the implementation changes the actual app flow.

### Architecture impact

The preferred implementation is mostly deployment and documentation work.

Potential architecture impact exists only if the implementation adds one of the following:

- A runtime config-validation module.
- A health/config validation endpoint.
- A new deployment-platform boundary documented in the architecture.
- A new dependency boundary for required external API availability.

If one of those is added, update `docs/architecture.md` and the relevant architecture UML. If the work is only provider setup, environment variables, build validation, and deployment docs, no architecture UML change is required.

### Testing approach

Run automated checks:

```text
npm test
npm run build
```

Manual checks:

- Confirm `dev` deploys to a protected owner-only environment.
- Confirm arbitrary visitors cannot use the protected `dev` deployment.
- Confirm `main` is reserved for the future beta baseline.
- Confirm missing required API credentials produce a controlled error/degraded state, not normal-looking readiness output.
- Confirm provider logs show build/runtime failures.
- Confirm rollback or disable-beta steps are understood.

### Review strategy

- Implementer self-check required before independent review: yes.
- Independent reviewer or model: use a stronger review model/pass for secrets, branch mapping, deployment protection, and external API failure behavior.
- Re-review scope after fixes:
  - Environment variable handling.
  - Deployment protection.
  - Missing-credential behavior.
  - Rollback/disable-beta documentation.
- Stop condition for review-fix loop:
  - No blocking findings remain around secrets, deployment exposure, missing API credentials, or beta-readiness claims.

## Implementation steps

1. Confirm Vercel is acceptable for the first deployment provider.
2. Create or connect the Vercel project to the GitHub repository.
3. Configure `main` as the production/beta-baseline branch.
4. Configure `dev` as the branch used for owner-only preview/dev-live testing.
5. Enable Vercel Authentication or equivalent platform protection for non-public deployments.
6. Add or update `.env.example` with required variable names only.
7. Add or update `docs/deployment.md` with:
   - environment model,
   - branch mapping,
   - secret handling,
   - deployment validation,
   - external API expectations,
   - rollback procedure,
   - disable-beta procedure.
8. Add Vercel Environment Variables for deployed real values.
9. Confirm local `.env.local` uses rotated credentials and is ignored by Git.
10. Verify that no real secrets are present in committed docs, plans, logs, screenshots, or templates.
11. Check how the app behaves when required external API credentials are missing.
12. Add or adjust controlled error/config validation behavior if the app currently produces misleading readiness results.
13. Run `npm test` locally.
14. Run `npm run build` locally.
15. Push/merge to `dev` and verify the protected dev-live deployment.
16. Promote to `main` only after checks pass and the owner accepts the baseline.
17. Tag the accepted baseline commit.
18. Record commands, deployment URLs/labels, and validation results in the execution log without writing secrets.
19. Complete the manual review checklist.
20. Update the beta launch checklist item statuses for this slice.

## Risks

- Secrets accidentally exposed in committed files, AI chats, logs, screenshots, or `NEXT_PUBLIC_` values.
- Vercel deployment protection misunderstood as app-level invite-only beta access.
- `dev` preview/dev-live environment accidentally accessible to arbitrary visitors.
- Missing external API credentials or runtime API failures produce misleading readiness results.
- Branch-to-environment mapping becomes unclear.
- Rollback restores code but leaves incompatible or stale environment variables.
- Overbuilding infrastructure before auth, feedback, and explanation slices are ready.

## Open questions

- What exact Vercel project name and URL naming convention should be used?
- Will the beta environment eventually use a custom domain or only a Vercel deployment URL?
- Should a small health/config endpoint be added now, or is provider log verification enough for this slice?
- Which exact environment variables are required by the current implementation?
- Are any API credentials currently optional in local development but required for beta readiness results?

## Exit criteria for review handoff

- Implementation matches the planned slice boundary.
- Required tests or checks for this slice have been run.
- Known deviations, shortcuts, and risks are written down for review.
- Deployment provider, branch mapping, env var source of truth, and rollback/disable-beta approach are documented.
- No real secrets are present in committed files or planning docs.

## Exit criteria for commit readiness

- Blocking review findings are resolved or explicitly accepted.
- The latest diff still matches the planned slice.
- Manual review is scoped to final regression, deployment safety, and documentation clarity checks only.
- The beta launch checklist still makes clear that deployment foundation is not launch approval.

## Definition of done

- Vercel is configured as the first deployment provider.
- `dev` can be deployed and accessed only by the owner.
- `main` is reserved as the future beta baseline.
- Required environment variable names are documented safely.
- Real deployed values are stored in Vercel Environment Variables.
- Rotated credentials are in use.
- Missing critical external API config does not produce normal-looking readiness output.
- `npm test` and `npm run build` pass.
- Rollback and disable-beta procedures are documented.
- Accepted baseline commit is tagged.
- Relevant docs are updated.
- Review has been completed.
