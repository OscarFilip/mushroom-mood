# Mushroom Mood Rename Implementation Plan

## Summary

Rename the application from the older Rain History and Mushroom Readiness naming mix to a single product identity: Mushroom Mood. Use the product subtitle "Weather signals for when your mushroom spot is worth checking." and include the repository rename in the same slice.

## Slice boundary

- This slice includes: product-name selection, product subtitle selection, repo and package rename planning, user-facing copy updates, internal identifier migration decisions, documentation and UML rename coverage, and test-update planning.
- This slice does not include: feature behavior changes, UI redesign beyond copy updates, or algorithm changes.
- Review this slice against: the current user request, existing naming surfaces in code and docs, and the repository planning workflow.

## Goal

Create a complete, implementation-ready rename plan so the app, repository, package metadata, docs, routes, components, services, tests, and generated assets can converge on Mushroom Mood without partial naming leftovers.

## Scope

- In scope: rename the product title, subtitle, package name, repository folder name, README, active planning files, and public-facing copy to Mushroom Mood.
- In scope: rename internal files, folders, symbols, imports, tests, and diagram source files where current names still reflect Rain History or Mushroom Readiness as product identity.
- In scope: document which weather-history terms should stay because they describe technical responsibilities rather than branding.
- Out of scope: introducing new features, changing API behavior, or reworking the weather-domain model beyond naming.

## Context

Relevant files and current naming surfaces:

- `package.json`
- `README.md`
- `app/page.tsx`
- `app/features/rain-history/`
- `app/features/mushroom-readiness/`
- `app/api/weather-history/rainy-days/route.ts`
- `app/api/mushroom-readiness/route.ts`
- `lib/services/rainHistoryService.ts`
- `lib/services/mushroomReadinessService.ts`
- `tests/app/api/weather-history/rainy-days/route.test.ts`
- `tests/app/api/mushroom-readiness/route.test.ts`
- `tests/lib/services/rainHistoryService.test.ts`
- `tests/lib/services/mushroomReadinessService.test.ts`
- `docs/feature-flows.md`
- `docs/architecture.md`
- `docs/uml/feature-nearest-station-weather.puml`
- `docs/uml/architecture-nearest-station-weather.puml`
- `docs/uml/architecture-nearest-station-weather-target.puml`
- `docs/uml/architecture-mushroom-mood.puml`

## Acceptance criteria

- All product-facing naming uses Mushroom Mood consistently.
- The chosen subtitle appears in the main UI and the core product description docs.
- The package and repository slug move away from `rainhistory-nextjs` to a Mushroom Mood-aligned name.
- Internal symbols and file paths no longer mix product names without an explicit technical reason.
- Tests and docs are updated to the new naming so the codebase reads as one coherent product.
- The plan explicitly identifies which generated files should be regenerated rather than hand-edited.

## Handoff readiness for implementation

- Code paths expected to change: app entry UI, package metadata, feature folders, API route folders, service modules, tests, README, docs, PlantUML source files, and workflow artifact names.
- Required tests or checks before review handoff: targeted Jest suites for renamed routes and services, plus a production build after import-path and route-path changes settle.
- Known risks to call out to the reviewer: route renames may break direct links, broad symbol renames may miss string literals, and generated diagram outputs can drift if source files change without regeneration.

## Proposed approach

### User flow impact

The primary UI identity changes from Mushroom Readiness to Mushroom Mood while preserving the same readiness-check flow. The subtitle should clarify the purpose so the new name stays understandable: "Weather signals for when your mushroom spot is worth checking."

Existing weather-history flows should either:

- be reframed as supporting Mushroom Mood weather evidence surfaces, or
- keep weather-history terminology only where they remain explicit technical sub-features rather than app identity.

### Architecture impact

Implementation should separate branding rename work from domain naming where possible.

Recommended naming policy:

- Use `MushroomMood` for app-level product identity, page copy, repo/package naming, top-level feature modules, and active planning artifacts.
- Keep descriptive weather-domain terms such as `WeatherDataRepository` when they describe the actual technical responsibility.
- Rename ambiguous product-carrying identifiers such as `RainHistoryService`, `WeatherHistory`, `MushroomReadiness`, and route segments that users or maintainers read as app identity.

Recommended target identifiers:

- Repo folder: `mushroom-mood`
- Package name: `mushroom-mood`
- Main UI component: `MushroomMood`
- Main feature folder: `app/features/mushroom-mood/`
- Readiness API route: keep `app/api/mushroom-readiness/route.ts`
- Readiness service: keep a descriptive readiness-oriented service name unless a rename is needed only to remove product-brand leakage
- Legacy rain-history feature folder: either remove from primary product identity or rename to a supporting weather-evidence feature if still exposed

Route migration note:

- Keep `/api/mushroom-readiness` as the route because it describes the capability clearly. Product branding should move to user-facing surfaces, while technical routes and related code can stay descriptive.

Diagram and docs policy:

- Edit `.puml` sources and markdown docs first.
- Regenerate SVGs under `docs/uml/out/` after source rename changes.
- Avoid manual edits to generated SVG output except for confirmed regeneration artifacts.

### Testing approach

Update focused tests alongside each rename boundary:

- route tests for import changes or surrounding file moves, while keeping the existing readiness API path stable
- service tests for any renamed module or exported function
- UI smoke coverage through the existing page build and test suite
- search-based verification that direct mentions of `rainhistory`, `Rain History`, `Mushroom Readiness`, and stale path names are removed or intentionally retained

### Review strategy

Review should focus on naming consistency, import-path integrity, route compatibility, and documentation completeness before worrying about behavior regressions.

- Implementer self-check required before independent review: yes
- Independent reviewer or model: separate review pass after rename implementation
- Re-review scope after fixes: files touched by import, path, route, and diagram regeneration changes
- Stop condition for review-fix loop: no blocking stale-name findings remain in source, tests, or docs

## Implementation steps

1. Rename product-facing copy in `README.md`, `app/page.tsx`, and related docs to Mushroom Mood and apply the chosen subtitle.
2. Rename package metadata and repository references from `rainhistory-nextjs` to `mushroom-mood`.
3. Rename the main readiness feature folder, component, route, service, and their tests from Mushroom Readiness naming to Mushroom Mood naming.
4. Rename old Rain History identifiers, files, and docs where they still act as product identity rather than a technical weather-data concern.
5. Update markdown docs and PlantUML source files to reflect Mushroom Mood as the primary application name.
6. Regenerate diagram outputs under `docs/uml/out/` from the updated `.puml` sources.
7. Run targeted tests for renamed services and related routes, then run a build to confirm import-path integrity while the descriptive readiness API path remains stable.
8. Rename planning artifact filenames and archive references if they still need to point at the active rename slice.
9. Rename the local repository folder after code and metadata changes are stable, then rerun the narrow validation commands from the new path.

## Risks

- The codebase currently mixes product-level and technical weather-history naming, so over-renaming can make technical responsibilities less clear.
- Renaming route paths and folders in the same slice increases the chance of broken imports or outdated test paths.
- Repository folder renames can confuse local tooling, open terminals, or editor state until the workspace is reopened from the new path.

## Open questions

- Should the legacy weather-history feature remain visible as a separate utility page, or be treated as internal evidence for Mushroom Mood only?
- Should historical archived planning docs preserve their original titles, or should only active/current docs move to the new name?

## Exit criteria for review handoff

- Implementation matches the planned rename boundary.
- Required tests or checks for renamed code paths have been run.
- Any intentionally retained legacy names are documented with a clear reason.
- Generated docs outputs were regenerated from updated source files.

## Exit criteria for commit readiness

- Blocking stale-name findings are resolved or explicitly accepted.
- The latest diff still matches the rename-only scope.
- Repo/package naming, UI naming, docs, and tests are aligned.

## Definition of done

- The app presents itself as Mushroom Mood everywhere that matters to users and maintainers.
- The subtitle is applied consistently in the main product surfaces.
- Internal rename work no longer leaves confusing Rain History or Mushroom Readiness leftovers without justification.
- Relevant docs, diagrams, tests, and workflow artifacts are updated.
- The repository is ready to be opened and used under the new folder name.