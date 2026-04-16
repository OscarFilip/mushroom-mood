# Project Docs

This folder is the planning and technical documentation home for the project.

## Docs structure

- [Feature flows](./feature-flows.md): user-facing and product-flow diagrams that explain what the app should do.
- [Architecture](./architecture.md): technical diagrams and notes that explain how features are implemented.
- [Done and testing](./done-and-testing.md): the project definition of done and minimum testing expectations.
- [Plans](./plans/README.md): planning, decision-log, execution-log, and review artifacts for feature work.
- [PlantUML source](./uml/): `.puml` source files.
- [Rendered diagrams](./uml/out/): generated SVG files used by Markdown docs.

## Diagram naming convention

- Use `feature-<name>.puml` for product or user flows.
- Use `architecture-<name>.puml` for current-state technical structure diagrams.
- Use `architecture-<name>-target.puml` for planned or in-progress target-state technical structure diagrams.
- Keep one diagram focused on one feature or subsystem.

## Diagram lifecycle convention

- Treat the current-state architecture diagram as the source of truth for what is implemented now.
- Use a separate target-state architecture diagram while a design is planned or in progress.
- Add a short status note such as `Planned` or `In Progress` to target-state diagrams.
- When the implementation is complete and stable, update the current-state diagram to match reality.
- Then remove the target-state diagram to avoid stale documentation.

## When to add which diagram

- Add a feature-flow diagram when you are clarifying user behavior, decisions, steps, or edge cases.
- Add an architecture diagram when you are deciding responsibilities across pages, APIs, services, repositories, or external systems.

## Recommended workflow

1. Write or update the `.puml` source in `docs/uml/`.
2. Preview it locally in VS Code.
3. Add or update the matching Markdown page in `docs/` and embed the generated SVG from `docs/uml/out/`.
4. Push to `main` and let GitHub Actions regenerate the SVG output.

## Working with agents

Agent-specific workflow rules live in the repository root [AGENTS.md](../AGENTS.md).

Planning files in [plans/README.md](./plans/README.md) are shared project artifacts intended to help both humans and tools follow the same implementation process.