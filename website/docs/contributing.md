---
sidebar_position: 10
---

# Contributing

`bb` is a solo side project but PRs and issues are welcome.

## Setup

```bash
git clone https://github.com/Hugo-Hbrt/bbucket-cli.git
cd bbucket-cli
npm install
npm test
```

Requires **Node ≥ 18**.

## Running the CLI locally

```bash
./bin/run.js auth
./bin/run.js branch list
```

There's no need to `npm link` unless you really want `bb` on your PATH while developing.

## Code style

- **Biome** handles formatting, linting, and import organization. Run `npm run check` to auto-fix.
- **TypeScript strict mode** plus `noUncheckedIndexedAccess`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.
- **Inline null guards** in DI constructors: `if (!dep) throw new Error("IDep is required")`.

## Adding a feature

The full loop, roughly:

1. Check `docs/bbucket/swagger.v3.json` for the relevant endpoint shape.
2. Extend `domain/types.ts` with any new types.
3. Add the method to `IBitbucketClient` (or the appropriate port).
4. Implement it in `HttpBitbucketClient` (or the appropriate adapter).
5. Add the business-logic method to the relevant `*Service`.
6. Create `src/commands/<topic>/<command>.ts`.
7. Add the `*Listed` / `*Shown` / `*Applied` method to `IOutputPort` + all three adapters (Table / Json / Ai).
8. Write acceptance tests in `test/<topic>.test.js` that stub the fake Bitbucket server.
9. Verify the acid test still passes.
