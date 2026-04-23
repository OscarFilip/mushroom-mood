# Project Docs

This folder holds the project docs.

## What is here

- [Feature flows](./feature-flows.md): user-facing behavior and product flows
- [Architecture](./architecture.md): system boundaries, layers, and request paths
- [Done and testing](./done-and-testing.md): the definition of done and the minimum test bar
- [Plans](./plans/README.md): plan, decision log, execution log, and review files for feature work
- [PlantUML source](./uml/): editable `.puml` files
- [Rendered diagrams](./uml/out/): generated SVG files used in the markdown docs

## Diagram file names

- Use `feature-<name>.puml` for product or user flows.
- Use `architecture-<name>.puml` for current-state architecture diagrams.
- Use `architecture-<name>-target.puml` for planned or in-progress architecture diagrams.
- Keep each diagram focused on one feature or subsystem.

## Diagram lifecycle

- Treat the current-state architecture diagram as the source of truth for what the app does now.
- Use a separate target-state diagram while you plan or build a larger change.
- Add a short status note such as `Planned` or `In Progress` to target-state diagrams.
- When the implementation is stable, update the current-state diagram.
- Then remove or archive the target-state diagram so the docs stay current.

## When to add a diagram

- Add a feature-flow diagram when you need to explain user steps, decisions, or edge cases.
- Add an architecture diagram when you need to explain responsibilities across pages, APIs, services, repositories, or external systems.

## Recommended workflow

1. Write or update the `.puml` source in `docs/uml/`.
2. Preview it in VS Code.
3. Update the matching markdown page in `docs/` and embed the generated SVG from `docs/uml/out/`.
4. Push to `main` and let GitHub Actions regenerate the SVG output.

## Working with agents

Agent workflow rules live in [AGENTS.md](../AGENTS.md).

Planning files in [plans/README.md](./plans/README.md) are shared project artifacts for both humans and tools.