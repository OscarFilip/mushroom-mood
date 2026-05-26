# Mushroom Mood

Mushroom Mood is a Next.js app for checking weather signals that help indicate when a mushroom spot is worth visiting.

**Weather signals for when your mushroom spot is worth checking.**

## Status

The app includes a working spot-check flow: choose a location and species, get a readiness result with probability, confidence, and seasonal state. Weather history data feeds the readiness calculation from SMHI.

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

Logging modes:

- Normal logging is the default. Just run `npm run dev`.
- Debug logging shows the extra API and payload tracing logs.

PowerShell examples:

```powershell
# Normal logging
npm run dev

# Debug logging for this PowerShell window
$env:MUSHROOM_MOOD_LOG_LEVEL='debug'
npm run dev

# Turn debug logging off again in this PowerShell window
Remove-Item Env:MUSHROOM_MOOD_LOG_LEVEL
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
