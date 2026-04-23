# Rain History

Rain History is a Next.js project for checking weather signals that may help predict mushroom readiness in Sweden.

The project is still in development. The current work focuses on planning the mushroom-readiness feature and keeping the code, diagrams, and decisions aligned.

## Status

The app already includes weather-history code and tests. The next product slice is the mushroom-readiness flow.

Current focus:

- define the first user flow
- lock down the main architecture
- document decisions before wider implementation

## Documentation

- [Project docs](./docs/README.md)
- [Feature flows](./docs/feature-flows.md)
- [Architecture](./docs/architecture.md)
- [Definition of done and testing](./docs/done-and-testing.md)

## Development

Start the app:

```bash
npm run dev
```

Useful scripts:

- `npm test`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run build`

## Diagrams

- PlantUML source files live in `docs/uml/`.
- Generated SVG files live in `docs/uml/out/`.
- `.puml` files are the source of truth.
- Preview diagrams in VS Code with the PlantUML extension.
- GitHub Actions regenerates SVG files on pushes to `main`.
