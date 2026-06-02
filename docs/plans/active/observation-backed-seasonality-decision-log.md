# Observation-Backed Seasonality Decision Log

## Decision

The target architecture must show two distinct external concerns: species observation search for runtime seasonal evidence, and taxon search for restricted species onboarding only.

## Why

Runtime readiness should only fetch evidence needed to evaluate a supported species near the selected spot. Taxon discovery is a catalog-management concern, not part of the normal user readiness flow.

## Alternatives considered

- Use one shared external-search boundary for both runtime and admin use
- Let runtime readiness perform taxon search when species metadata is incomplete

## Tradeoffs

- This keeps the runtime path simpler and easier to reason about.
- It requires the curated catalog to carry stronger external identifiers up front.

## Impacted files or areas

- `docs/uml/architecture-mushroom-mood-target.puml`
- `docs/uml/feature-mushroom-page.puml`
- Curated species catalog design
- Seasonal observation repository contract

---

## Decision

Store taxon IDs in the curated species catalog so runtime readiness does not need taxon search.

## Why

Supported species are a controlled catalog. Their external identity should be resolved during onboarding so runtime requests can go straight to seasonal observation lookup.

## Alternatives considered

- Resolve taxon IDs on every readiness request
- Keep only display names in the curated catalog

## Tradeoffs

- This reduces runtime complexity and external dependency count.
- It makes onboarding and catalog maintenance responsible for identity quality.

## Impacted files or areas

- `lib/data/mushroomSpecies.ts`
- Restricted species-management planning
- Seasonal observation repository inputs

---

## Decision

Use a radius ladder rather than a single fixed radius, with `3 km` as the primary radius, widening steps of `5 km` then `10 km`, and a `15 km` hard cap fallback for the first slice.

## Why

Mushroom fruiting is local and habitat-sensitive, so the first query should stay tight. Sparse-data fallbacks need wider coverage, but widening should happen deliberately rather than starting with a broad regional search. A live Ullared probe for `Boletus edulis` returned `0` observations at `3 km`, `2` at `5 km`, `6` at `10 km`, and `20` at `15 km`, which supports keeping the smaller radii first while retaining `15 km` as a hard fallback when the tighter radii stay sparse.

## Alternatives considered

- One fixed radius for all lookups
- Start broad at `10 km` or more
- Cap the first slice at `10 km`
- Defer radius defaults entirely until implementation

## Tradeoffs

- A ladder preserves local meaning better than a large default radius.
- It introduces fallback logic that must be tested and documented.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- Seasonal observation repository behavior

---

## Decision

Start with a `10-year` historical lookback for seasonal evidence, and widen radius before widening the year span. Only after the radius ladder is exhausted should the first slice expand the lookback to `15 years`.

## Why

The seasonal question is about what is usually favorable around this time of year near a chosen spot, not only what happened in the current year. A multi-year historical window gives a stronger seasonal baseline. The live Ullared probe showed that widening from `10 km` to older years would add very little compared with widening from `10 km` to `15 km`, so radius expansion should come first.

## Alternatives considered

- Current year only
- Shorter fixed lookback such as `3` or `5` years
- Commit immediately to a longer fixed lookback such as `15` years
- Widen year span before widening radius

## Tradeoffs

- Ten years is a strong default for recent seasonality.
- Sparse areas may still need wider spatial search and, in some cases, deeper history.
- Expanding radius first improves evidence density faster, but it also weakens how local the signal is.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- Seasonal evidence aggregation design

---

## Decision

Verification weighting should start as follows: verified and not uncertain observations get full weight, unverified but not uncertain observations get medium weight, and uncertain identifications get low weight.

## Why

A verified-only filter would likely throw away too much useful signal, but uncertainty still needs to be penalized so low-quality identifications do not dominate the seasonal evidence.

## Alternatives considered

- Verified-only observations
- Equal weighting for all returned records
- Exclude all uncertain and all unverified observations

## Tradeoffs

- This keeps enough data to form a signal in sparse areas.
- Weight tuning may still change after real-data experiments.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- Seasonal evidence scoring logic

---

## Decision

Dataset strategy should start with an allowlist, with Artportalen as the default trusted dataset.

## Why

Source-level trust is a separate concern from per-record verification. The first slice should avoid treating every returned dataset as equally valid by default.

## Alternatives considered

- Accept all datasets returned by the API
- Score datasets dynamically before the first implementation slice
- Ignore dataset identity completely and rely only on record verification flags

## Tradeoffs

- Allowlisting is safer and easier to reason about in the first slice.
- If the API currently returns only one practical source, this may feel heavier than necessary at first.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- Repository filtering behavior

---

## Decision

The first scoring design should use a normalized circular day-of-year density curve with a `+/- 30 day` kernel window, and return a seasonality score from `0` to `100` where the local observed peak normalizes to `100`.

## Why

The goal is to infer peak season versus off-season from historical local observations, not merely count whether a few records exist. A normalized seasonal density curve fits that goal better than a simple yes-or-no gate, and it avoids assuming the season is a perfectly symmetric normal distribution.

## Alternatives considered

- Keep a static month-based season calendar only
- Use raw observation counts without seasonal normalization
- Force a strict normal-distribution model
- Use a percentile-only model without a day-of-year curve

## Tradeoffs

- This gives implementation a concrete first formula.
- The kernel width and state thresholds may still need tuning after real-world testing.

## Impacted files or areas

- Seasonal observation repository output shape
- Readiness-service contract
- `docs/seasonal-observation-policy.md`

---

## Decision

The seasonal observation repository should classify evidence as `missing`, `sparse`, or `sufficient` using deterministic thresholds based on weighted observation count and year spread.

## Why

The readiness service needs a stable contract for degraded behavior. Raw observation count alone is too weak because a small cluster from one year can look stronger than it really is.

## Alternatives considered

- Raw count threshold only
- Distinct-year threshold only
- Keep sufficiency subjective until implementation

## Tradeoffs

- This gives implementation and tests a stable contract.
- The exact numeric thresholds may still need tuning after more live probes and species comparisons.

## Impacted files or areas

- Seasonal observation repository contract
- `docs/seasonal-observation-policy.md`
- `lib/data/seasonalObservationPolicy.ts`
- `lib/services/mushroomReadinessService.ts`

---

## Decision

The seasonal observation repository contract for this slice should return `seasonalityScore`, `evidenceQuality`, `radiusUsedMeters`, `lookbackYearsUsed`, `weightedObservationCount`, `distinctObservationYears`, and `limitations` to the readiness service.

## Why

These fields are now in scope because the UI is expected to show them. They remain a focused contract because each field has a direct end-to-end consumer: the readiness service or the user-facing explanation UI.

## Alternatives considered

- Return only a support label such as `supported`, `partial`, or `missing`
- Keep the earlier minimal contract of only `seasonalityScore`, `evidenceQuality`, and `limitations`
- Return repository-specific raw counts and let the service decide everything else

## Tradeoffs

- This expands the contract slightly compared with the earlier minimum.
- The added fields are justified because they are intended for direct UI use now rather than speculative future use.
- Raw records and deeper breakdowns still stay out of scope until a concrete consumer appears.

## Impacted files or areas

- Seasonal observation repository contract
- Readiness-service seasonal derivation
- `lib/services/mushroomReadinessService.ts`
- UI evidence rendering
- `app/features/mushroom-mood/MushroomMood.tsx`

---

## Decision

The public readiness response should expose the UI-visible seasonal evidence fields under `explanation.seasonalEvidence` rather than flattening them directly on `explanation`.

## Why

That grouped shape keeps the response easier to read and makes it clear that these fields are one coherent evidence block, not a series of unrelated top-level explanation properties.

## Alternatives considered

- Flatten `seasonalEvidenceQuality`, `radiusUsedMeters`, `lookbackYearsUsed`, `weightedObservationCount`, and `distinctObservationYears` directly under `explanation`
- Create a separate top-level `seasonalEvidence` object outside `explanation`

## Tradeoffs

- Grouping improves clarity and keeps the contract organized.
- It adds one extra nesting level, but that nesting reflects the conceptual structure of the data.

## Impacted files or areas

- Public readiness response contract
- `lib/services/mushroomReadinessService.ts`
- `app/features/mushroom-mood/MushroomMood.tsx`
- Future readiness route and service tests

---

## Decision

Remove `speciesTimingSupport` from the future readiness response once observation-backed seasonality is implemented.

## Why

In the current response shape, `speciesTimingSupport` adds no independent value because it mirrors `seasonalSupport`. Keeping both after the static calendar path is replaced would make the API look richer than it really is and would imply two separate seasonal signals where there is only one.

## Alternatives considered

- Keep `speciesTimingSupport` as a duplicate field
- Keep `speciesTimingSupport` and rename `seasonalSupport`
- Replace `speciesTimingSupport` immediately with several new public evidence fields

## Tradeoffs

- Removing the duplicate field keeps the public contract clearer.
- Future consumers that genuinely need richer seasonal evidence will require an intentional end-to-end addition instead of inheriting unused data by default.

## Impacted files or areas

- `lib/services/mushroomReadinessService.ts`
- `app/features/mushroom-mood/MushroomMood.tsx`
- Future readiness route and service tests

---

## Decision

The seasonal observation repository should return processed seasonal evidence rather than raw observation records.

## Why

The readiness service needs one stable seasonal-evidence contract, not a second layer of source-specific filtering and interpretation logic. Keeping raw-record handling inside the repository preserves a cleaner boundary and simpler tests.

## Alternatives considered

- Return raw observation records and let the readiness service aggregate them
- Split filtering into the repository and scoring into the readiness service

## Tradeoffs

- This keeps external-data quirks out of the readiness service.
- It makes repository tests more important because more interpretation happens at that boundary.

## Impacted files or areas

- Seasonal observation repository contract
- `lib/services/mushroomReadinessService.ts`
- Repository and service tests

---

## Decision

The first freshness strategy should cache processed seasonal evidence with a `24 hour` TTL and allow stale-if-error reuse for up to `7 days`.

## Why

Observation-backed seasonality is derived from multi-year historical patterns, so it does not need live refetch on every readiness request. A daily TTL is a practical balance between freshness, latency, and rate-limit protection.

## Alternatives considered

- Live fetch on every request
- Much shorter TTL such as one hour
- Much longer TTL such as one week without refresh attempts

## Tradeoffs

- A daily TTL is simple and operationally safe for the first slice.
- It can delay visibility of very recent new observations, but that is acceptable for this historical seasonal signal.
- Stale-if-error reuse improves resilience, but it requires the UI and service to surface freshness limitations honestly.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- Seasonal observation repository behavior
- Readiness limitations and confidence handling

---

## Decision

The long-run cache direction should be a persistent derived-evidence cache behind the repository boundary, with in-memory cache acceptable only as an initial implementation shortcut.

## Why

Persistent cache storage survives restarts, reduces repeated external lookups across instances, and gives more consistent behavior as the product grows.

## Alternatives considered

- Treat in-memory cache as the long-run strategy
- Persist raw observations instead of derived evidence
- Skip cache persistence entirely and rely only on live fetches plus retries

## Tradeoffs

- Persistent cache storage adds implementation and operational complexity.
- It provides better long-run reliability, rate-limit protection, and multi-instance consistency than an in-memory-only approach.
- Keeping the cache at the derived-evidence level avoids the complexity of storing raw observation dumps without a concrete need.

## Impacted files or areas

- Seasonal observation repository design
- Future cache storage implementation
- Deployment and operations expectations

---

## Decision

The readiness service should fall back to the existing static species calendar when observation-backed evidence is `missing`, still `sparse` after the full fallback ladder, or temporarily unavailable without reusable stale cached evidence.

## Why

The first slice should improve seasonal independence without making readiness brittle in sparse-data areas or during temporary external outages.

## Alternatives considered

- Treat observation evidence as a hard dependency and return unknown readiness when it fails
- Always use sparse observation evidence even when it is too weak to be robust
- Show observation and static-calendar seasonality as parallel first-class signals in the same response

## Tradeoffs

- This keeps product behavior resilient during the transition away from the static calendar.
- It means the first implementation still carries a transitional fallback path that will need clear limitations and confidence handling.

## Impacted files or areas

- `docs/seasonal-observation-policy.md`
- `lib/services/mushroomReadinessService.ts`
- Readiness response limitations and confidence behavior
- Route and service tests

---

## Decision

Readiness-service tests for observation-backed seasonality should mock the `SeasonalObservationRepository`, and external fetch logic must not be mixed directly into the readiness service.

## Why

The service should be tested against the repository contract, not against HTTP behavior, cache storage, or API-specific filtering details. That keeps service tests focused, deterministic, and fast.

## Alternatives considered

- Let readiness-service tests hit the real repository and mock HTTP beneath it
- Move external fetch logic into the readiness service and test end to end from there

## Tradeoffs

- This keeps the service boundary clean and the tests easier to reason about.
- It requires a separate repository test layer for cache and external-data behavior.

## Impacted files or areas

- `lib/services/mushroomReadinessService.ts`
- Seasonal observation repository interface
- Service and repository tests

---

## Decision

Time should be injected anywhere seasonal state or freshness behavior depends on the current date, rather than reading the real clock directly.

## Why

Seasonal labels and cache TTL behavior must be testable year round. Reading the real current date would make some branches unstable or impossible to exercise reliably.

## Alternatives considered

- Keep using `new Date()` directly and rely on broad test windows
- Mock the global clock in every affected test without introducing an explicit time boundary

## Tradeoffs

- Injected time makes service and repository behavior deterministic.
- It adds a small dependency boundary that implementation must thread through the affected code paths.

## Impacted files or areas

- `lib/services/mushroomReadinessService.ts`
- Seasonal observation repository implementation
- Test helpers and time-sensitive tests

---

## Decision

Automated repository integration tests should stay separate from readiness-service tests and should use controlled fixtures or mocked HTTP responses rather than live ArtDatabanken dependency in the default test suite.

## Why

The repository needs some realism around payload shape, filtering, and cache transitions, but the default automated suite should stay deterministic, fast, and independent of external availability or secrets.

## Alternatives considered

- Use live API calls in default CI test runs
- Skip repository integration tests and rely only on unit tests

## Tradeoffs

- This preserves determinism while still checking the repository against realistic response shapes.
- It requires maintaining a small set of representative fixtures.

## Impacted files or areas

- Seasonal observation repository tests
- Test fixtures or HTTP mocks
- CI test scope