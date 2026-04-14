# CLAUDE.md — bb CLI Developer Guide

This file is read by Claude Code at the start of every session. It contains everything needed to work on this project consistently.

---

## What this project is

`bb` is a Bitbucket Cloud CLI tool written in TypeScript. It lets developers manage branches, pull requests, pipelines, and deployment environments from the terminal via the Bitbucket REST API.

Full product spec: `spec.md`
Feature list and implementation order: `features.md`

---

## Tech stack

- **Runtime**: Node.js ≥ 18
- **Language**: TypeScript
- **CLI framework**: Oclif
- **HTTP**: Native `fetch` (Node 18+)
- **Output**: `chalk` for colors, `cli-table3` for tables
- **Distribution**: `pkg` binary + npm

---

## Architecture

Clean Architecture. Dependency arrows point inward only — the core has zero external dependencies.

```
Commands (Oclif)          ← knows everything, wires the app
Services (Use Cases)      ← knows domain + ports, no framework or I/O
Domain                    ← pure types and logic, no imports
Ports (interfaces)        ← contracts defined by the core, implemented outside
Adapters                  ← implement ports, own all I/O (HTTP, filesystem, terminal)
```

### Rules

- **The domain and services import nothing external.** No `fetch`, no `fs`, no Oclif, no chalk. Ever.
- **Ports are interfaces defined by the core.** `IBitbucketClient`, `IConfigReader`, `IOutputPort`. Services call these interfaces and never know what's behind them.
- **Adapters implement ports.** `BitbucketApiClient` implements `IBitbucketClient`. `JsonConfigReader` implements `IConfigReader`. `TableOutput` implements `IOutputPort`. All I/O lives here.
- **Commands are thin wiring.** Instantiate adapters → inject into services → call service → pass result to output adapter. No logic.
- **Dependency injection via constructors.** Services receive port interfaces at construction time. No service instantiates its own dependencies.

---

## Project structure

```
src/
  domain/
    types.ts              # PullRequest, Branch, Pipeline, Environment, etc.
    errors.ts             # DomainError, ValidationError, NotFoundError, etc.
  ports/
    IBitbucketClient.ts   # Interface for all API operations
    IConfigReader.ts      # Interface for reading config
    IOutputPort.ts        # Interface for rendering results
  services/
    PullRequestService.ts
    BranchService.ts
    PipelineService.ts
    EnvService.ts
  adapters/
    api/
      BitbucketApiClient.ts   # implements IBitbucketClient, owns fetch + auth + pagination
    config/
      JsonConfigReader.ts     # implements IConfigReader, reads ~/.bb-cli-config.json
    output/
      TableOutput.ts          # implements IOutputPort, uses chalk + cli-table3
  commands/
    pr/
    branch/
    pipeline/
    env/
    browse/
```

---

## Authentication

- Uses Bitbucket **API tokens** (not app passwords — deprecated June 2026)
- HTTP Basic Auth: `base64(email:api_token)`
- The `email` field is the Atlassian account email, not the Bitbucket username
- All config comes from `~/.bb-cli-config.json` only — no environment variable overrides
- A 401 response must distinguish between wrong credentials and an expired token

---

## Bitbucket API reference

The full Bitbucket Cloud REST API v2.0 OpenAPI spec is checked into the repo at `docs/bbucket/swagger.v3.json`. Consult it before writing new adapter code to confirm endpoint paths, request parameters, and response shapes — don't guess the schema from memory or from what another method returns. Pay particular attention to optional fields (e.g. `target.author.user` is only present when the commit author email is linked to a Bitbucket account) and to pagination envelopes (`values`, `next`, `pagelen`, `size`).

---

## Key behaviours to preserve

- `bb pr create` must abort if the source branch has no commits ahead of destination
- `bb pr merge` defaults to merge commit strategy; accepts `--strategy merge|squash|fast-forward`
- `bb pipeline wait` polls every 5 seconds, default timeout 1 hour, exits code 1 on timeout
- `bb env create-variable` prompts to confirm if the variable already exists
- `bb env update-variable` warns and aborts if the variable does not exist
- `bb branch delete` and `bb env delete-variable` always prompt for confirmation unless `--yes` is passed
- `bb branch list` is sorted by most recently updated first
- `bb pr list` defaults to open PRs; accepts `--state open|merged|declined|superseded`
- `bb pr diff` outputs raw diff to stdout — must remain pipeable

---

## Error handling

- All errors are caught globally via Oclif's `catch()` hook — do not add per-command try/catch
- Empty results exit 0 with a friendly message (e.g. "No open PRs found.")
- All unexpected errors exit 1
- Network errors suggest checking connectivity
- Missing config suggests running `bb auth`

---

## Output

- Default: coloured table via `cli-table3` + `chalk`
- `--json` flag: raw JSON to stdout, full API response object
- `--no-color`: disables chalk
- Do not add TTY detection — out of scope for v1

---

## Implementation order

Follow the phase order in `features.md`:
1. Authentication
2. JSON output mode
3. Read-only commands (branch list, pr list/view/diff/commits/comments, pipeline list/latest, env list/variables)
4. Write actions (pr create/checkout/review, pipeline run/custom/wait, env create/update)
5. Destructive actions (pr merge/decline, branch delete, env delete-variable)
6. Quality of life (browse, shell autocomplete)

---

## Testing approach

- **Domain**: pure unit tests, no mocks needed — just logic and types
- **Services**: unit tested by injecting mock implementations of port interfaces — no network, no filesystem, no terminal
- **Adapters**: integration tested in isolation (API client against real or recorded HTTP, config reader against a temp file)
- **Commands**: minimal — if services and adapters are tested, commands are just wiring
