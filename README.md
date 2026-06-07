# Mushroom Mood

Mushroom Mood is a Next.js app for checking weather signals that help indicate when a mushroom spot is worth visiting.

**Weather signals for when your mushroom spot is worth checking.**

[![Tests](https://github.com/OscarFilip/mushroom-mood/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/OscarFilip/mushroom-mood/actions/workflows/tests.yml)

## Status

The app includes a working spot-check flow: choose a location and species, get a readiness result with probability, confidence, and seasonal state. Weather history data feeds the readiness calculation from SMHI.

## Documentation

- [Project docs](./docs/README.md)
- [Feature flows](./docs/feature-flows.md)
- [Architecture](./docs/architecture.md)
- [Definition of done and testing](./docs/done-and-testing.md)

## Deployment

Deployment runs on Vercel.

- Preview deployments are used for `dev` live testing.
- `main` is reserved as the future beta baseline and is protected before app-level auth.
- Vercel is the source of truth for deployment status.
- [Deployment docs](./docs/deployment.md) contain the current deployment model, environment variable rules, rollback steps, and disable-beta procedure.

## Development

Start the app:

```bash
npm run db:migrate
npm run dev
```

Neon-backed local database:

```bash
npm run db:migrate
npm run dev
```

Schema workflow with Drizzle:

```bash
# After changing lib/db/schema.ts
npm run db:generate
npm run db:migrate
```

Quick disposable local sync:

```bash
npm run db:push
```

Set `DATABASE_URL` in `.env.local` to your local Neon database connection string before running the app or Drizzle commands.

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

- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:push`
- `npm run db:studio`
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
