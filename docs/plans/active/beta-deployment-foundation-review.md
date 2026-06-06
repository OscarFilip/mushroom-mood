# beta-deployment-foundation Review

## Review scope

Independent review of the implementation commit against the plan, current-work stop condition, and execution log.

- Review round: `independent-review-1`
- Reviewer model or agent: `review-agent`
- Reviewed diff, commit, or file scope: `596a6e86562968e80bc12b4ec0e46677b8493289` relative to `fcbdecdbee6a2c6d5790b12af0b323ebb84417f3`
- Review type: independent review

## Previous findings status

- Resolved: `n/a`
- Partially resolved: N/A
- Accepted as follow-up: N/A
- Still open: N/A

## Findings

### High severity

- `.env.example` and the deployment docs no longer satisfy the slice requirement to record the exact env vars read by the repo. The implementation adds `NEXT_PUBLIC_APP_ENV`, `SMHI_API_BASE_URL`, `SMHI_API_KEY`, `ARTDATABANKEN_API_BASE_URL`, `INATURALIST_API_BASE_URL`, and `INATURALIST_API_KEY` as if they are part of the runtime configuration surface, but the implementation only reads `ARTDATABANKEN_API_KEY`, `MUSHROOM_MOOD_LOG_LEVEL`, and `ENABLE_VERBOSE_API_LOGGING` from `process.env`. This turns the committed env template and deployment instructions into speculative configuration instead of an exact source of truth, which is the opposite of what the plan requires. Affected files: `.env.example`, `docs/deployment.md`, and `docs/plans/active/beta-deployment-foundation-execution-log.md`.

- The slice is presented as ready to move into review even though the implementation stop condition is still unmet. The execution log explicitly marks the Vercel/GitHub connection, `dev` deployment creation, `main` protection, and Vercel env-scope setup as pending manual setup, yet the self-review says all blocking criteria are confirmed and the active-work note says to advance to review after those same tasks. Per the plan and current-work stop condition, this work is not review-complete until the deployment mapping and protection are actually validated or a blocker is documented. Affected files: `docs/plans/active/beta-deployment-foundation-execution-log.md`, `docs/plans/active/beta-deployment-foundation-review.md`, and `docs/plans/active/current-work.md`.

### Medium severity

- None.

### Low severity

- None.

## Finding priority summary

### Blocking before merge

Review cannot be completed until:

- `.env.example`, `docs/deployment.md`, and the execution log are reduced to the env vars the code actually reads.
- The Vercel/GitHub mapping, deployment protection, and env-scope setup are either performed and recorded or replaced with a documented blocker.

### Non-blocking follow-up

After the blocking items are addressed, rerun a targeted review over the same slice and confirm the active-work stage can be moved forward without contradicting the execution log.

## Sign-Off

**Review status:** Blocking findings recorded.

**Issues found:** 2 high-severity findings.

**Recommended next step:** Address the blocking findings, update the execution record with real deployment validation, and then request a targeted re-review.

Potential follow-ups:

- Add or improve health/config endpoint only if existing readiness routes/provider logs are not enough for validation.
- Add CI workflow checks in GitHub Actions.
- Add architecture/UML update if config validation becomes a meaningful runtime boundary.
- Archive active slice files after completion, while keeping `docs/deployment.md` as the maintained deployment reference.

## Test coverage gaps

No code-test regression was introduced by the reviewed commit, but the slice still lacks the required manual deployment-validation evidence for `dev` protection, `main` inaccessibility before auth, and real Vercel env-scope verification.

## Architecture and plan adherence

- Matches plan: partial
- Deviations from plan: the env-var documentation is broader than the exact runtime surface, and the slice was advanced before the deployment-validation stop condition was met.

Review should check whether any implementation change requires updates to:

- `docs/architecture.md`
- `docs/uml/architecture-mushroom-mood.puml`
- `docs/uml/architecture-mushroom-mood-target.puml`
- `docs/feature-flows.md`
- feature-flow UML files

Expected result:

- No feature-flow UML update unless user-visible flow changed.
- Architecture docs/UML update only if a real config/health/deployment boundary was added.

## Handoff recommendation

- Recommended next owner: `human` or `implementation-agent`, depending on who will correct the docs and complete the manual Vercel setup.
- Recommended next action: fix the env-var documentation scope, complete or explicitly block the manual deployment validation, and then request a targeted re-review.
- Suggested stop condition for this round: the two blocking findings above are resolved and recorded in the execution log.

## Recommended follow-up

1. After this slice is complete, activate `beta-access-control` as the next beta-blocking work slice.
2. Keep `beta-launch-checklist.md` as the release gate and update its deployment-foundation status.
3. Do not invite beta testers until access control, explanation transparency, feedback capture, and launch-gate checks are complete.
