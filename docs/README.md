# Project Docs

This folder is the planning and technical documentation home for the project.

## Docs structure

- [Feature flows](./feature-flows.md): user-facing and product-flow diagrams that explain what the app should do.
- [Architecture](./architecture.md): technical diagrams and notes that explain how features are implemented.
- [PlantUML source](./uml/): `.puml` source files.
- [Rendered diagrams](./uml/out/): generated SVG files used by Markdown docs.

## Diagram naming convention

- Use `feature-<name>-flow.puml` for product or user flows.
- Use `architecture-<name>.puml` for technical structure diagrams.
- Keep one diagram focused on one feature or subsystem.

## When to add which diagram

- Add a feature-flow diagram when you are clarifying user behavior, decisions, steps, or edge cases.
- Add an architecture diagram when you are deciding responsibilities across pages, APIs, services, repositories, or external systems.

## Recommended workflow

1. Write or update the `.puml` source in `docs/uml/`.
2. Preview it locally in VS Code.
3. Add or update the matching Markdown page in `docs/`.
4. Push to `main` and let GitHub Actions regenerate the SVG output.