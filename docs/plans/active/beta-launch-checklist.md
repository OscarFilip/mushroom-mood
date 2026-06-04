# Beta Launch Checklist

Use this checklist to track the remaining work before inviting privileged beta users/testers.

## Feature Work

| Area | Task | Why it matters |
| --- | --- | --- |
| Auth | Add login/sign-in and invite-only access control | Prevents non-beta users from entering the app |
| Auth | Add role checks for any restricted/admin-only screens | Keeps internal tools and maintenance flows separated from beta users |
| Transparency | Show the main inputs behind each readiness result | Helps testers understand why the app gave a score |
| Transparency | Expose weather, seasonal evidence, and species-state explanations | Makes the calculation auditable and easier to trust |
| Transparency | Explain fallback behavior when evidence is missing or weak | Reduces confusion when results are uncertain |
| Feedback | Add a way to mark results as helpful, wrong, or unclear | Gives you direct signal on whether the algorithm feels accurate |
| Feedback | Capture feedback alongside the displayed explanation and result | Makes later investigation and tuning possible |
| Feedback | Decide whether feedback is only collected or also used for recalibration | Prevents scope creep during the beta |
| Onboarding | Add a short beta-user guide or first-run explanation | Sets expectations for what the score means and does not mean |

## Non-Feature Launch Work

| Area | Task | Why it matters |
| --- | --- | --- |
| Deployment | Set up staging and production environments | Lets you test the full release path before inviting testers |
| Deployment | Configure secrets, environment variables, and API credentials | Prevents runtime failures after launch |
| Deployment | Verify build, runtime, and rollback behavior in production-like conditions | Reduces release risk if something breaks |
| Monitoring | Add logging or alerts for auth, API, and algorithm failures | Helps you spot issues quickly during the beta |
| Monitoring | Decide who reviews feedback and operational issues during beta | Ensures responses do not stall after launch |
| Security | Review stored user data, access boundaries, and invite-only enforcement | Protects the beta from accidental exposure |
| Security | Add privacy or terms pages if required | Avoids legal and trust gaps before inviting users |
| Readiness | Run manual smoke tests for the beta flow end to end | Confirms the main path works outside unit tests |
| Readiness | Define rollback or pause criteria for external API issues | Gives you a plan if dependencies become unreliable |
| Validation | Confirm the current scoring inputs are stable enough for a small beta | Prevents overpromising on an immature signal set |
| Validation | Define what success looks like for the first tester cohort | Lets you judge whether the beta is working |

## Suggested Launch Order

1. Auth and invite-only gating.
2. Transparency for the readiness score.
3. Feedback capture and beta-user guidance.
4. Deployment and environment hardening.
5. Monitoring, security review, and smoke testing.

## Launch Gate

Do not invite privileged beta users until all of these are true:

- Only intended users can reach the app.
- The score explanation is understandable enough to defend the result.
- Feedback can be collected and reviewed.
- The app deploys cleanly to production-like infrastructure.
- A rollback or pause plan exists for external dependency failures.