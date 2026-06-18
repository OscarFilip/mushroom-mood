# Seasonal Observation Policy

This document defines the policy for observation-backed seasonality in Mushroom Mood.

It exists so seasonal scoring stays explainable, testable, and safe to degrade when data is sparse or unavailable.

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

- Supported species store ArtDatabanken taxon IDs in the curated catalog.
- Runtime readiness reads the stored taxon ID and goes directly to observation search.
- Restricted onboarding resolves and confirms taxon identity before a species is added.

## Search policy

### Radius ladder

Use this order:

1. `3 km`
2. `5 km`
3. `10 km`
4. `15 km`

`15 km` is the current hard cap.

Reason:

- In the live Ullared probe for `Boletus edulis`, `3 km` returned `0` observations.
- `5 km` returned `2` observations, with only `1` in the last `10` years.
- `10 km` returned `6` observations, with `4` in the last `10` years.
- `15 km` returned `20` observations, with `16` in the last `10` years.
- Extending time alone would have added little at `10 km`, because most additional records were much older and did not materially improve the current seasonal signal.

### Lookback window

- Primary lookback: `10 years`
- Sparse-data fallback: `15 years`

Widen radius before widening lookback.

Reason: in the Ullared `Boletus edulis` probe, widening radius improved the evidence more than extending time alone.

## Freshness policy

- Cache processed seasonal evidence, not raw observation payloads.
- Default TTL: `24 hours`.
- If refresh fails, stale-if-error reuse is allowed for up to `7 days`.
- Attach a limitation when stale cache is used.
- Long term, move from in-memory cache to a persistent derived-evidence cache.

Reason:

- Seasonal evidence is based on historical multi-year patterns, so sub-daily refresh is unnecessary for the first slice.
- A `24 hour` TTL keeps the product reasonably fresh while protecting latency, reliability, and rate limits.
- Persistent cache storage gives better long-run behavior than in-memory cache because it survives restarts and supports multi-instance consistency.

## Quality policy

Per-record verification weights:

| Observation quality | Weight |
| --- | ---: |
| verified and not uncertain | `1.0` |
| not verified and not uncertain | `0.6` |
| uncertain identification | `0.2` |

Dataset weights:

| Dataset | Weight |
| --- | ---: |
| Artportalen | `1.0` |
| iNaturalist | `0.9` |

Artportalen remains the primary trusted source. iNaturalist is included because it can improve sparse-area coverage.

## Seasonal scoring

The repository produces a seasonality score from `0` to `100`.

Interpretation:

- `0`: no meaningful local seasonal support
- `100`: today aligns with the local observed peak season in the filtered historical evidence

Current scoring shape:

1. Filter observations by taxon, radius, lookback window, and allowed dataset.
2. Weight records by verification quality and dataset.
3. Project each observation date onto day-of-year.
4. Build a circular kernel-density curve with a `+/- 30 day` influence window.
5. Evaluate today's day-of-year against that curve.
6. Normalize the highest curve value in the filtered evidence to `100`.
7. Return today's normalized value as the seasonal score.

Initial state thresholds:

| Score | State |
| ---: | --- |
| `65-100` | `in-season` |
| `35-64` | `shoulder-season` |
| `0-34` | `out-of-season` |

These thresholds are implementation defaults, not final biological claims.

## Evidence sufficiency

Classify evidence after dataset filtering, verification weighting, radius selection, and lookback selection.

| State | Rule |
| --- | --- |
| `missing` | no allowed observations |
| `sparse` | some observations exist, but thresholds below are not met |
| `sufficient` | all thresholds below are met |

Sufficient evidence requires:

- weighted observation count at least `4.0`
- observations from at least `3` distinct years
- observations from at least `2` distinct years within the base `10-year` lookback

Sparse evidence should not be presented as robust local seasonality.

## Degraded behavior

When evidence is weak or unavailable:

- widen radius before widening lookback
- fall back to the static species calendar when evidence stays too sparse
- reuse stale processed evidence when allowed and clearly mark it
- fall back safely when the external lookup fails and no usable cache exists

The readiness response should expose seasonal evidence status so the UI can explain whether the result came from sufficient observations, sparse observations, missing observations, or stale cache.

Suggested limitation codes:

- `seasonal-evidence-unavailable`
- `seasonal-evidence-sparse`
- `seasonal-evidence-expanded-radius`
- `seasonal-evidence-expanded-lookback`
- `seasonal-evidence-stale-cache`

## Confidence impact

Current implementation uses a simple confidence policy:

- lower confidence when observation-backed seasonality cannot be used and the service falls back to the static calendar
- keep the current confidence model when radius or lookback is widened
- surface stale cache through limitations, without an extra confidence penalty for now

Finer confidence tuning can come later.

## Known limitations

- Observation density is not true abundance.
- Recorder behavior and popular locations can bias the curve.
- Sparse rural areas may need larger radii than dense reporting areas.
- The model supports readiness explanation; it does not prove mushroom presence or safety.
