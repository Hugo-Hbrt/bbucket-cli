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

## Architecture

`bb` follows clean architecture. Dependency arrows point **inward only**:

```
commands/         ← Oclif entry points, thin wiring
    ↓
services/         ← business logic, depends only on ports
    ↓
ports/            ← interfaces (I*)
    ↓
domain/           ← pure types + logic, ZERO external imports
    ↑
adapters/         ← implementations of ports (HTTP, git, fs, inquirer, ...)
```

An **acid test** enforces this at build time — `test/smoke.test.js` walks every file under `src/domain`, `src/ports`, and `src/services` and fails if any import escapes the inward-only rule.

## Testing strategy

All tests are **acceptance tests** that spawn the compiled `bin/run.js` as a subprocess and assert on its stdout / stderr / exit code. No unit tests, no internal-module mocks. External dependencies are replaced with in-process fakes:

- **Bitbucket HTTP** — a real `node:http` server that matches stubs by path
- **git** — a Node script installed on `PATH` that records args to a log file
- **Browser** — a `LogBrowserOpener` that writes URLs to a log file (swapped in when `BB_BROWSE_LOG` env var is set)
- **Polling sleep** — `BB_INSTANT_POLL=1` makes `setTimeout` a no-op for pipeline wait tests

Run the full suite:

```bash
npm test
```

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
