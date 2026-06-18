# Mushroom Mood

Mushroom Mood is a Next.js app for checking whether a mushroom spot looks worth visiting.

It combines weather history, seasonal observation data, species rules, and confidence signals into one readiness result.

## Live app

- Production: [mushroommood.se](https://mushroommood.se)
- Development/preview: [dev.mushroommood.se](https://dev.mushroommood.se)

## Current status

The app has a working beta-style spot-check flow:

1. sign in through the beta gate
2. choose a location and mushroom species
3. get a readiness result with probability, confidence, seasonal state, and supporting evidence

Mushroom Mood is experimental. It is not foraging safety, edibility, or medical advice.

## What this repo shows

- Next.js and TypeScript app structure
- API routes with validation and auth checks
- external API integration with SMHI and ArtDatabanken
- mapping from third-party data into internal models
- fallback behavior for sparse or unavailable data
- database-backed auth and feedback foundations with Drizzle and Postgres
- unit and integration-style tests with Jest
- planning, decision, execution, and review docs for AI-assisted development

## Tech stack

- Next.js
- TypeScript
- Auth.js
- Drizzle
- Postgres / Neon
- Jest
- Vercel

## Local development

Install dependencies, set environment variables, run migrations, then start the app.

```bash
npm install
npm run db:migrate
npm run dev
```

Useful commands:

```bash
npm test
npm run build
npm run db:generate
npm run db:migrate
npm run db:studio
```

Required runtime config is documented in [deployment.md](./docs/deployment.md). Do not commit real secrets.

## Documentation

Start here:

- [Project docs](./docs/README.md)
- [Architecture](./docs/architecture.md)
- [Feature flows](./docs/feature-flows.md)
- [Deployment](./docs/deployment.md)
- [Done and testing](./docs/done-and-testing.md)
- [Test guide](./tests/README.md)

## Diagrams

PlantUML source files live in `docs/uml/`. Generated SVG files live in `docs/uml/out/`.

The `.puml` files are the source of truth. Generated SVGs are committed so the diagrams render in GitHub.
