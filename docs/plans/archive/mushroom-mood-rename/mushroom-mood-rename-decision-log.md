# Mushroom Mood Rename Decision Log

## Decision

Use `Mushroom Mood` as the primary product name.

## Why

It is the chosen brand direction and is distinct enough to replace both the legacy Rain History identity and the more literal Mushroom Readiness label.

## Alternatives considered

- `Fungi Forecast`
- `The Spore Score`
- Keep `Mushroom Readiness` as the product name and use `Mushroom Mood` only as a marketing label

## Tradeoffs

- The name is more brand-like than descriptive, so it needs a strong subtitle.
- It is more memorable than the current literal naming.

## Impacted files or areas

- Product copy
- Package metadata
- Repo name
- Main feature naming

---

## Decision

Use the subtitle `Weather signals for when your mushroom spot is worth checking.`

## Why

The product name is playful, so the subtitle should immediately explain the practical weather-driven purpose of the app.

## Alternatives considered

- `Know when your mushroom spot is worth checking.`
- `Forecast the right time to check your spot.`
- `Weather clues for your next mushroom trip.`

## Tradeoffs

- This subtitle is clearer than it is poetic.
- It emphasizes the spot-first use case, which matches the current product direction.

## Impacted files or areas

- `app/page.tsx`
- `README.md`
- Feature and architecture docs

---

## Decision

Rename app-level features, services, routes, and tests that currently carry product identity, but keep descriptive weather-domain names where they reflect stable technical responsibilities.

## Why

Not every weather-related identifier is branding. Preserving precise technical names avoids replacing clear domain language with vague product language.

## Alternatives considered

- Rename every weather-related identifier to Mushroom Mood terminology
- Leave most internal naming untouched and only change UI copy

## Tradeoffs

- This requires judgment during implementation.
- It avoids a codebase that sounds branded but becomes harder to maintain.

## Impacted files or areas

- `lib/repositories/`
- `lib/services/`
- `app/api/`
- `docs/uml/`

---

## Decision

Keep the descriptive readiness API route and related technical naming where they clearly describe the capability, even while the product name becomes Mushroom Mood.

## Why

`mushroom-readiness` explains what the endpoint does better than the brand name does. Product identity and technical capability naming should not be forced to match when that would reduce clarity.

## Alternatives considered

- Rename the route and service surface to Mushroom Mood terminology
- Keep all current names without separating product naming from technical naming

## Tradeoffs

- This creates an intentional distinction between branding and implementation naming.
- It keeps routes, tests, and service boundaries clearer for future maintenance.

## Impacted files or areas

- `app/api/mushroom-readiness/route.ts`
- readiness-related tests
- implementation naming policy for services and route handlers

---

## Decision

Keep the repository folder rename in scope and target the slug `mushroom-mood`.

## Why

Leaving the repository itself as `rainhistory-nextjs` would preserve the most visible old-name artifact and keep local paths, package metadata, and future references inconsistent.

## Alternatives considered

- Rename only the package metadata
- Rename the product but keep the repo folder as-is for convenience
- Use a longer slug such as `mushroom-mood-nextjs`

## Tradeoffs

- Folder rename work is operationally awkward in a live workspace.
- The shorter slug is cleaner for local paths, package metadata, and future repository URLs.

## Impacted files or areas

- Workspace folder path
- `package.json`
- `package-lock.json`
- Documentation references to the repo name

---

## Decision

Treat generated SVG files under `docs/uml/out/` as regeneration outputs, not hand-edited rename targets.

## Why

The PlantUML `.puml` files are the source of truth. Regenerating avoids manual drift and keeps documentation reproducible.

## Alternatives considered

- Hand-edit generated SVG text nodes
- Leave generated outputs stale until a later cleanup

## Tradeoffs

- Regeneration adds one more step to the implementation slice.
- It keeps the docs pipeline honest and repeatable.

## Impacted files or areas

- `docs/uml/*.puml`
- `docs/uml/out/*.svg`