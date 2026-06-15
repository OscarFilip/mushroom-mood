# Project Docs

This folder holds the project docs.

## What is here

- [Feature flows](./feature-flows.md): user-facing behavior and product flows
- [Architecture](./architecture.md): system boundaries, layers, and request paths
- [Done and testing](./done-and-testing.md): the definition of done and the minimum test bar
- [Plans](./plans/README.md): plan, decision log, execution log, and review files for feature work
- [PlantUML source](./uml/): editable `.puml` files
- [Rendered diagrams](./uml/out/): generated SVG files used in the markdown docs

Current source layout:

- `docs/uml/feature/current/`: implemented user-visible feature flows
- `docs/uml/feature/target/`: planned or in-progress feature flows
- `docs/uml/architecture/current/`: implemented architecture diagrams
- `docs/uml/architecture/target/`: planned or in-progress architecture diagrams

## Diagram file names

- Put implemented feature flows in `docs/uml/feature/current/<name>.puml`.
- Put planned or in-progress feature flows in `docs/uml/feature/target/<name>.puml`.
- Put implemented architecture diagrams in `docs/uml/architecture/current/<name>.puml`.
- Put planned or in-progress architecture diagrams in `docs/uml/architecture/target/<name>.puml`.
- Keep each `@startuml` id aligned with the `.puml` basename.
- Keep each diagram focused on one feature or subsystem.

## Diagram lifecycle

- Treat current-state diagrams as the source of truth for what the app does now.
- Use a separate target-state diagram while you plan or build a larger change.
- Prefer the file name, not an internal comment, as the primary status signal for current vs target diagrams.
- When the implementation is stable, update the current-state diagram.
- Then remove or archive the target-state diagram so the docs stay current.

## When to add a diagram

- Add a feature-flow diagram when you need to explain user steps, decisions, or edge cases.
- Add an architecture diagram when you need to explain responsibilities across pages, APIs, services, repositories, or external systems.

## Feature-flow status rules

- Keep files under `docs/uml/feature/current/` limited to user-visible behavior that is implemented now.
- Put planned or materially different future user-visible behavior under `docs/uml/feature/target/`.
- Do not mix current and future behavior in one feature-flow file when the difference matters for review or planning.
- Use `docs/feature-flows.md` as the index that links current and target feature-flow diagrams.

## Recommended workflow

1. Write or update the `.puml` source in `docs/uml/`.
2. Preview it in VS Code.
3. Update the matching markdown page in `docs/` and embed the generated SVG from `docs/uml/out/`.
4. Push to `main` and let GitHub Actions regenerate the SVG output.

## Rendered SVG naming

- Keep the `@startuml` id aligned with the `.puml` basename so the generated SVG name stays predictable.
- Current and target diagrams can safely share the same basename because they render into different output folders.
- When renaming a diagram source file, regenerate the matching SVG under `docs/uml/out/` and keep the markdown link aligned.

## Working with agents

Agent workflow rules live in [AGENTS.md](../AGENTS.md).

Planning files in [plans/README.md](./plans/README.md) are shared project artifacts for both humans and tools.