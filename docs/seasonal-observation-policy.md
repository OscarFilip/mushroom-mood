# Seasonal Observation Policy

## Purpose

This document defines the first stable planning policy for observation-backed seasonality in Mushroom Mood.

It covers:

- observation source
- runtime versus admin-only external API concerns
- radius ladder and fallback order
- lookback window
- freshness and cache persistence direction
- verification and dataset weighting
- seasonal scoring shape
- degraded behavior and confidence impact
- known limitations

## External API boundaries

### Runtime seasonal evidence

Use the ArtDatabanken species observation search endpoint at runtime:

- Method: `POST`
- URL: `https://api.artdatabanken.se/species-observation-system/v1/Observations/Search`
- Auth header: `Ocp-Apim-Subscription-Key`

Runtime queries should search by:

- stored taxon ID from the curated species catalog
- point geometry for the chosen spot
- policy-driven radius ladder
- policy-driven lookback window

### Restricted species onboarding

Use the ArtDatabanken taxon search endpoint only for restricted onboarding and catalog maintenance:

- Method: `GET`
- URL: `https://api.artdatabanken.se/taxonservice/v1/taxa/search?searchString=<name>`

Normal readiness requests must not depend on taxon search.

## Identity policy

- Supported species store ArtDatabanken taxon IDs in the curated species catalog.
- Runtime readiness reads the stored taxon ID and goes straight to observation search.
- Restricted onboarding resolves and confirms taxon identity before a species is added to the catalog.

## Search policy

### Radius ladder

Use this radius ladder for the first slice:

- `3 km` primary lookup
- `5 km` first sparse-data fallback
- `10 km` second sparse-data fallback
- `15 km` hard cap fallback for the first slice

### Lookback window

- Primary lookback: `10 years`
- Fallback lookback after the radius ladder is exhausted: `15 years`

### Fallback order

Widen radius before widening the year span.

Reason:

- In the live Ullared probe for `Boletus edulis`, `3 km` returned `0` observations.
- `5 km` returned `2` observations, with only `1` in the last `10` years.
- `10 km` returned `6` observations, with `4` in the last `10` years.
- `15 km` returned `20` observations, with `16` in the last `10` years.
- Extending time alone would have added little at `10 km`, because most additional records were much older and did not materially improve the current seasonal signal.

For the first slice, this means the fallback order should be:

1. `3 km`
2. `5 km`
3. `10 km`
4. `15 km`
5. If evidence is still sparse, extend the lookback to `15 years`

## Freshness policy

- Cache processed seasonal evidence, not raw observation payloads.
- Default TTL: `24 hours`.
- If refresh fails, allow stale-if-error reuse for up to `7 days` and attach a limitation indicating that stale cache was used.
- The long-run architectural target is a persistent derived-evidence cache behind the repository boundary.
- An in-memory cache is acceptable only as a first implementation shortcut for a small single-instance rollout.

Reason:

- Seasonal evidence is based on historical multi-year patterns, so sub-daily refresh is unnecessary for the first slice.
- A `24 hour` TTL keeps the product reasonably fresh while protecting latency, reliability, and rate limits.
- Persistent cache storage gives better long-run behavior than in-memory cache because it survives restarts and supports multi-instance consistency.

## Quality policy

### Verification weighting

Use these per-record weights:

- verified and not uncertain: `1.0`
- not verified and not uncertain: `0.6`
- uncertain identification: `0.2`

### Dataset policy

Use an allowlist, with Artportalen as the default trusted source.

Initial approved datasets for the first slice:

- `Artportalen`
- `iNaturalist`

Initial dataset weights:

- `Artportalen`: `1.0`
- `iNaturalist`: `0.9`

Reason:

- Artportalen remains the primary trusted source.
- The live Ullared probe showed that `iNaturalist` materially improved sparse-area coverage at `10 km` and `15 km`.
- The slight weight reduction keeps Artportalen primary without throwing away useful evidence.

## Seasonal scoring model

### Output

The seasonal observation repository should produce a seasonality score from `0` to `100`.

Interpretation:

- `0` means no meaningful local seasonal support
- `100` means today aligns with the locally observed peak season in the filtered historical evidence

### First-slice scoring shape

Use a normalized circular day-of-year density curve rather than a fixed month calendar or a strict normal distribution.

Recommended first model:

1. Filter observations by taxon, radius, lookback window, and allowed datasets.
2. Weight records by verification quality and dataset weight.
3. Project each observation date onto day-of-year.
4. Build a circular kernel-density curve with a `+/- 30 day` influence window.
5. Evaluate today's day-of-year against that curve.
6. Normalize the highest curve value in the filtered evidence to `100`.
7. Return today's normalized value as the seasonal score.

This keeps the model local and seasonal without assuming the season is perfectly symmetric.

### Initial state thresholds

Use these draft thresholds for the first slice:

- `65-100`: `in-season`
- `35-64`: `shoulder-season`
- `0-34`: `out-of-season`

These thresholds are implementation defaults, not final biological claims.

## Degraded behavior

- If no allowed observations are found even after the full radius ladder, return missing seasonal evidence and fall back to the static species calendar for the seasonal contribution.
- If observations exist but remain sparse after the full radius ladder, widen the lookback to `15 years` before giving up.
- If evidence is still too sparse for a stable seasonal score after the widened lookback, fall back to the static species calendar rather than presenting the sparse observation score as robust.
- If the external lookup fails but a stale cached result exists inside the reuse window, return the stale processed evidence with a freshness limitation.
- If the external lookup fails and no usable cached result exists, fall back to the static species calendar and attach an availability limitation.

The readiness response should still expose `explanation.seasonalEvidence` on fallback so the UI can show whether the seasonal result came from sufficient observations, sparse observations, missing observations, or stale cache.

## Evidence sufficiency thresholds

The seasonal observation repository should classify evidence as `sufficient`, `sparse`, or `missing` deterministically.

Evaluation should happen on the filtered and weighted observation set after dataset filtering, verification weighting, and the active radius and lookback policy have been applied.

### `missing`

Return `missing` when the filtered set contains `0` allowed observations.

### `sparse`

Return `sparse` when the filtered set contains at least one observation, but fails any of these thresholds:

- weighted observation count is less than `4.0`
- distinct observation years are fewer than `3`
- distinct observation years within the base `10-year` lookback are fewer than `2`

### `sufficient`

Return `sufficient` when all of these are true:

- weighted observation count is at least `4.0`
- distinct observation years are at least `3`
- distinct observation years within the base `10-year` lookback are at least `2`

### Why these thresholds

- They are simple enough to implement and test deterministically.
- They avoid calling a tiny cluster of one-year or two-year sightings a stable seasonal signal.
- They keep the live Ullared `Boletus edulis` case in the intended buckets: `3 km` is `missing`, `5 km` is `sparse`, and `10 km` is the first likely `sufficient` radius.
- They measure both amount of evidence and spread across years, which is more defensible than raw count alone.

Suggested limitation codes for the first slice:

- `seasonal-evidence-unavailable`
- `seasonal-evidence-sparse`
- `seasonal-evidence-expanded-radius`
- `seasonal-evidence-expanded-lookback`
- `seasonal-evidence-stale-cache`
- `seasonal-fallback-static-calendar`

## Confidence impact

Confidence should decrease when:

- the query had to widen beyond `10 km`
- the query had to widen beyond `10 years`
- the filtered evidence depends heavily on non-default datasets
- the seasonal score is supported by very few weighted observations or few distinct years
- fallback to the static species calendar was required
- stale cache had to be reused because live refresh failed

Confidence should increase when:

- the result is supported within the smaller radii
- multiple recent years contribute to the same seasonal pattern
- the score is supported mostly by verified or otherwise higher-weight records

## Known limitations

- Observation density is not the same thing as true abundance.
- Recorder behavior and popular sites can bias the curve.
- A sparse rural area may need larger radii than a dense reporting area.
- Testing strategy for time control and repository mocking is intentionally deferred to the next planning pass.
