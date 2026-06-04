# Observation-Backed Seasonality Implementation Plan

## Summary

Define the minimum stable planning slice for replacing static species-calendar seasonality with observation-backed seasonal evidence in Mushroom Mood.

## Slice boundary

- This slice includes: source choice, repository boundary, runtime versus admin search separation, initial observation policy defaults, fallback behavior expectations, and readiness-service contract direction.
- This slice does not include: saved spots, full species-management workflow design, expert rule editing, final scoring formula tuning, or implementation code.
- Review this slice against: `docs/plans/active/current-work.md`, `docs/uml/architecture-mushroom-mood-target.puml`, and `docs/uml/feature-mushroom-page.puml`.

## Goal

Make seasonal evidence independent from the current static species timing rules while keeping the first planned architecture narrow enough to implement without dragging admin workflow, saved spots, or broader factor tuning into the same slice.

## Scope

- In scope: a runtime observation-search boundary for seasonal evidence near the selected spot.
- In scope: a restricted taxon-search boundary for curated species onboarding only.
- In scope: initial policy defaults for radius, lookback window, verification weighting, dataset allowlist direction, and degraded behavior.
- Out of scope: exact expert-editing workflow, final mathematical distribution model, UI implementation, and real API experiments that require local secrets.

## Context

Relevant files and prior work:

- `docs/plans/active/current-work.md`
- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- `lib/services/mushroomReadinessService.ts`
- `docs/uml/architecture-mushroom-mood-target.puml`
- `docs/uml/feature-mushroom-page.puml`

Current implementation context:

- The readiness service still uses static species timing and does not fetch seasonal observations.
- The target architecture already reserves a `Seasonal Observation Repository` boundary.
- Planning must now decide the smallest stable contract for that repository and the policy values it should use first.

## Acceptance criteria

- Runtime seasonal observation search is separated from restricted taxon search in the planning artifacts.
- The plan states that curated species store taxon IDs so runtime readiness does not depend on taxon search.
- Initial defaults for radius, lookback window, verification weighting, and dataset policy are documented clearly enough to guide implementation.
- Freshness, cache persistence direction, and degraded behavior are defined clearly enough to guide implementation without reopening the repository boundary.
- Testing ownership, time control, and automated-test scope are defined clearly enough to implement without coupling the readiness service to external fetch logic.
- Open questions are limited to scoring refinements and evidence-tuning details rather than core architecture ambiguity.

## Handoff readiness for implementation

- Code paths expected to change: `lib/services/mushroomReadinessService.ts`, new seasonal observation repository code under `lib/repositories/` or `lib/services/`, `app/api/mushroom-readiness/route.ts`, curated species data, and policy/config files.
- Required tests or checks before review handoff: seasonal-observation repository unit tests, a few repository integration tests against mocked external responses, readiness-service tests with a mocked seasonal repository and injected time source, route tests for degraded responses, and `npm test` plus `npm run build`.
- Known risks to call out to the reviewer: observation API quality and sparsity, radius/time-window tuning, and ambiguity around final seasonality scoring shape.

## Proposed approach

### User flow impact

The normal readiness flow stays taxonomy-free for users. Users choose a spot and a supported species, and readiness uses stored taxon identity behind the scenes. Taxon search appears only in restricted species onboarding.

### Architecture impact

The target architecture should explicitly show two external concerns:

- species observation search for runtime seasonal evidence
- taxon search for restricted species onboarding only

The curated species catalog should store external taxon IDs so runtime readiness can query seasonal observations directly for supported species without calling taxon search.

The first stable repository boundary should be a `Seasonal Observation Repository` that accepts:

- spot coordinates
- supported species identifier or taxon ID
- policy-driven search parameters

And returns:

- `seasonalityScore` as `0-100` or `null` when evidence is missing
- `evidenceQuality` as `sufficient`, `sparse`, or `missing`
- `radiusUsedMeters`
- `lookbackYearsUsed`
- `weightedObservationCount`
- `distinctObservationYears`
- `limitations` so the readiness service can explain degraded seasonal evidence without reinterpreting repository internals

The repository should return processed seasonal evidence rather than raw sightings. That keeps external API quirks, filtering rules, and scoring details behind one stable boundary instead of leaking them into the readiness service.

The readiness service should derive `seasonalState` and `seasonalSupport` from that repository output and the existing policy thresholds.

### Freshness and persistence

The first repository should cache processed seasonal evidence, not raw observation payloads.

Recommended first policy:

- default TTL: `24 hours`
- stale-if-error reuse window: up to `7 days`
- cache payload: the processed seasonal evidence contract returned to the readiness service

Long-run direction:

- prefer a persistent derived-evidence cache behind the repository boundary so cached results survive restarts, reduce rate-limit pressure, and stay consistent across instances
- allow a simple in-memory cache only as an implementation shortcut for a small single-instance rollout, with the persistent cache still treated as the architectural target

This keeps the readiness contract stable while leaving storage mechanics replaceable.

### Readiness response evolution

The first planned response-contract change should stay focused, but it now has a concrete UI consumer for a small set of richer seasonal evidence fields:

- remove `speciesTimingSupport`
- keep `seasonalSupport`
- group the new UI-visible seasonal evidence fields under `explanation.seasonalEvidence`

Reason:

- today `speciesTimingSupport` adds no independent value because it mirrors `seasonalSupport`
- once observation-backed seasonality replaces the static calendar path, keeping both fields would suggest two separate signals when there is only one seasonal signal
- these additional fields now have a concrete end-to-end consumer in the UI, so they are no longer speculative payload expansion

Planned shape:

```text
explanation: {
	summary: string;
	weatherSupport: SupportLevel;
	seasonalSupport: SupportLevel;
	seasonalEvidence: {
		quality: 'sufficient' | 'sparse' | 'missing';
		radiusUsedMeters: number | null;
		lookbackYearsUsed: number | null;
		rawObservationCount: number | null;
		weightedObservationCount: number | null;
		distinctObservationYears: number | null;
	};
}
```

This keeps the public response easier to scan by grouping the seasonal evidence details instead of flattening them across `explanation`.

Out of scope for the first response contract unless a concrete consumer appears later:

- observation dates or histograms
- dataset-level breakdowns
- verification breakdowns
- raw observation records

### Degraded behavior

Observation-backed seasonality should be the primary path, but the first slice should keep the existing static species calendar as a fallback when the repository cannot provide robust evidence.

Recommended behavior:

- if repository evidence is `sufficient`, use the observation-backed seasonal score and support label
- if repository evidence is `sparse` or `missing`, fall back to the static species calendar for the seasonal contribution
- if live refresh fails but a reusable stale cached result exists inside the freshness window, use that stale processed evidence with an explicit freshness limitation
- if live refresh fails and no reusable stale cached result exists, fall back to the static species calendar for the seasonal contribution
- whenever fallback is used, lower confidence and include explicit limitations so the UI can show that the seasonal result was degraded
- preserve `explanation.seasonalEvidence` even on fallback so the user can still see whether evidence was sparse, missing, or served from stale cache

This keeps the product resilient during the transition away from the static calendar without pretending that sparse observation evidence is stronger than it is.

### Testing approach

Keep testing centered on contract behavior rather than final math tuning:

- readiness-service tests should mock the `SeasonalObservationRepository` rather than exercise external fetch logic indirectly through the service
- repository tests should cover radius expansion, evidence aggregation, cache freshness behavior, and stale-if-error reuse
- repository integration tests should stay separate and use controlled API fixtures or mocked HTTP responses rather than live external dependency in default test runs
- route tests should verify limitation and degraded-result payloads without re-testing repository internals
- time should be injected where season windows, current date, or TTL behavior matter so tests do not depend on the real clock

Minimum scenario matrix for the first slice:

- sufficient observation evidence
- sparse evidence with static-calendar fallback
- missing evidence with static-calendar fallback
- live refresh failure with reusable stale cache
- live refresh failure without reusable stale cache
- deterministic seasonal-state boundaries using injected time rather than `new Date()`

Out of scope for default automated tests:

- live ArtDatabanken dependency in CI
- exhaustive scoring-tuning experiments across many species and places
- admin-only taxon onboarding flow beyond its own boundary tests

### Review strategy

Review should first check architecture boundary clarity and policy decisions, then verify that implementation preserves the planned separation between runtime observation lookup and admin-only taxon search.

- Implementer self-check required before independent review: yes
- Independent reviewer or model: separate review pass after implementation
- Re-review scope after fixes: changed repository/service contract, degraded-result behavior, and policy mapping
- Stop condition for review-fix loop: no blocking gaps in architecture adherence, degraded behavior, or contract coverage

## Implementation steps

1. Create the active plan, decision log, execution log, and review artifacts for observation-backed seasonality.
2. Refine the target architecture wording so runtime observation search and admin-only taxon search are distinct concerns.
3. Convert the planning defaults into a human-readable seasonal policy doc and a machine-readable policy/config shape.
4. Define the seasonal observation repository contract and degraded-response behavior for readiness.
5. Run the real observation API radius experiment once the local environment has a key available in the terminal.
6. Move to implementation after the repository contract, policy defaults, and degraded behavior are stable enough.

## Risks

- Sparse observations may force widening search radius or widening the historical lookback window more often than expected.
- A naive scoring model could overfit raw observation density rather than true local seasonality.
- Mixed dataset quality may require stricter allowlisting or weighting than the first policy assumes.

## Open questions

- Validate the first test matrix against implementation complexity once the repository interface is introduced, but do not reopen the boundary decisions unless that check exposes a real mismatch.

## Exit criteria for review handoff

- Implementation matches the planned slice boundary.
- Required tests or checks for this slice have been run.
- Known deviations, shortcuts, and risks are written down for review.

## Exit criteria for commit readiness

- Blocking review findings are resolved or explicitly accepted.
- The latest diff still matches the planned slice.
- Manual review is scoped to final regression and clarity checks only.

## Definition of done

- Planning artifacts for this slice exist and reflect the agreed decisions.
- The target architecture explicitly separates runtime observation search from admin-only taxon search.
- Policy defaults and unresolved scoring questions are documented without conflating them.
- Testing strategy is documented so implementation can keep external fetch logic out of readiness-service tests and keep time-dependent behavior deterministic.
- The project is ready to enter implementation without reopening the core slice boundary.