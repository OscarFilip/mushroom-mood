# Project Docs

This folder holds the durable project documentation for Mushroom Mood.

For a quick project overview, start with the root [README](../README.md).

## Main docs

- [Architecture](./architecture.md): app layers, boundaries, and integration flow
- [Feature flows](./feature-flows.md): user-facing flows and diagrams
- [Deployment](./deployment.md): Vercel environments, domains, config, rollback, and beta safety
- [Done and testing](./done-and-testing.md): definition of done and minimum test bar
- [Seasonal observation policy](./seasonal-observation-policy.md): policy for observation-backed seasonality
- [Plans](./plans/README.md): planning, decision, execution, and review records

## Diagrams

Diagram source files live in `docs/uml/`.

Generated SVG files live in `docs/uml/out/` and are rendered through Github Actions workflow [Render PlantUml diagrams](../.github/workflows/plantuml.yml)

Current layout:

```text
docs/uml/
  feature/current/       implemented user flows
  feature/target/        planned user flows
  architecture/current/  implemented architecture
  architecture/target/   planned architecture
  out/                   generated SVG output
```

Use `.puml` files as the source of truth.

## When to update docs

Update docs when a change affects:

- user-visible behavior
- API or service boundaries
- external integrations
- deployment or environment variables
- testing expectations
- known limitations or beta safety

Use plans and logs for temporary work notes. Keep the main docs current and durable.
