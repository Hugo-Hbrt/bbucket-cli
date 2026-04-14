# bb — Bitbucket CLI Tool Specification

## Overview

`bb` is a command-line interface for interacting with Bitbucket Cloud via the Bitbucket REST API. It lets developers manage branches, pull requests, pipelines, environments, and more directly from the terminal, without opening a browser.

---

## Tech Stack

- **Runtime**: Node.js (≥ 18)
- **Language**: TypeScript
- **CLI framework**: [Oclif](https://oclif.io/)
- **HTTP client**: `node-fetch` or native `fetch` (Node 18+)
- **Config storage**: `~/.bb-cli-config.json` (JSON file in home directory)
- **Output formatting**: `chalk` for colors, `cli-table3` for tabular output
- **Distribution**: Single compiled binary via `pkg`; also publishable to npm

---

## Authentication

Bitbucket Cloud has deprecated app passwords in favour of **API tokens**. App passwords stop working entirely on June 9, 2026. This CLI uses API tokens exclusively.

### Config file

Credentials and workspace/repo context are stored at `~/.bb-cli-config.json`:

```json
{
  "email": "john.doe@example.com",
  "api_token": "ATB...",
  "workspace": "my-workspace",
  "repo_slug": "my-repo",
  "output_style": "normal"
}
```

> **Note**: The `email` field is the Atlassian account email address (found under *Email aliases* in Bitbucket personal settings), **not** the Bitbucket username. This is required for REST API authentication with tokens.

> **Note**: `output_style` is optional and defaults to `"normal"`. Accepted values are `"normal"` (colored table output), `"json"` (raw JSON), and `"ai"` (minimal, token-efficient plain text). Managed via `bb option`.

### Commands

| Command | Description |
|---|---|
| `bb auth` / `bb auth save` | Interactive prompt to save email, API token, workspace, and default repo slug |
| `bb auth show` | Display current saved auth info (token masked as `****`) |

### How to create an API token

1. Go to **Settings → Atlassian account settings → Security**
2. Select **Create and manage API tokens → Create API token with scopes**
3. Name the token, set an expiry date, select **Bitbucket** as the app
4. Assign the required scopes (see below)
5. Copy the token immediately — it is shown only once

### Required scopes

| Scope | Reason |
|---|---|
| `Repositories: Read` | List branches, fetch repo info |
| `Pull requests: Read` | List and view PRs, diffs, commits, comments |
| `Pull requests: Write` | Create, merge, approve, decline PRs |
| `Pipelines: Read` | List and get pipeline details |
| `Pipelines: Write` | Trigger pipeline runs |
| `Variables: Read` | List environment variables |
| `Variables: Write` | Create and update environment variables |

> Tokens can optionally be scoped to a specific workspace at creation time for tighter security.

### HTTP Basic Auth

Every API call authenticates via HTTP Basic Auth:
- **Username**: Atlassian account email
- **Password**: API token

```
Authorization: Basic base64(email:api_token)
```

> All configuration comes exclusively from `~/.bb-cli-config.json`. No environment variable overrides are supported.

---

## Global Flags

| Flag | Description |
|---|---|
| `--output-style <style>` | Output style for this invocation: `normal` (default), `json`, or `ai`. Overrides the saved default in the config file. |
| `--no-color` | Disable colored output |
| `-h, --help` | Show help |

---

## Commands

### `bb auth`

Manage authentication credentials.

```
bb auth              # alias for bb auth save
bb auth save         # Interactive: prompts for email, API token, workspace, repo
bb auth show         # Print current config (token masked as ****)
```

---

### `bb option`

Manage persistent CLI preferences. The saved default applies to every command and can be overridden per invocation with `--output-style`.

```
bb option --output-style <style>   # Set the default output style (normal|json|ai)
bb option show                     # Display current preferences
```

**Styles:**

| Style | Description |
|---|---|
| `normal` | Formatted table output with `cli-table3` and `chalk` colors — default |
| `json` | Raw JSON to stdout, suitable for piping into `jq` |
| `ai` | Minimal, token-efficient plain text — no box borders, no padding, no color codes. Intended for LLM ingestion or simple scripting (`awk`, `cut`, etc.) |

The value is persisted under `output_style` in `~/.bb-cli-config.json`.

---

### `bb branch`

Manage and browse branches.

```
bb branch list                     # List all branches in the repo
bb branch name <filter>            # List branches whose name contains <filter>
bb branch user <filter>            # List branches whose latest commit author contains <filter>
bb branch delete <name>            # Delete a branch. Prompts for confirmation; use --yes to skip
```

**Output columns**: branch name, latest commit hash (short), author, commit date, behind/ahead (if available). Sorted by most recently updated first.

---

### `bb pr`

Manage pull requests.

```
bb pr list [branch]                # List open PRs; optionally filter by destination branch
                                   # Flag: --state <state> (open|merged|declined|superseded, default: open)
bb pr view <pr-id>                 # Show details of a PR (title, description, reviewers, status)
bb pr create <src> <dest>          # Create a PR from <src> branch to <dest> branch
                                   # Flags: --title <title> --description <desc>
                                   # If --title is omitted, prompts interactively
                                   # Aborts with an error if <src> has no commits ahead of <dest>
bb pr merge <pr-id>                # Merge a PR
                                   # Flag: --strategy <strategy> (merge|squash|fast-forward, default: merge)
bb pr decline <pr-id>              # Decline a PR
bb pr approve <pr-id>              # Approve a PR
bb pr no-approve <pr-id>           # Remove approval from a PR
bb pr request-changes <pr-id>      # Mark PR as "Request changes"
bb pr no-request-changes <pr-id>   # Remove "Request changes" status
bb pr diff <pr-id>                 # Print the PR diff to stdout; pipeable to any file, editor or command
bb pr commits <pr-id>              # List commits in a PR
bb pr comments <pr-id>             # List comments on a PR (inline and general)
bb pr checkout <pr-id>             # Fetch and checkout the source branch of a PR locally
```

**`bb pr list` output columns**: PR ID, title, author, source branch → destination branch, status, created date

**`bb pr view` output**: full detail view including description, reviewers and their statuses, commit count, comment count

---

### `bb pipeline`

Manage Bitbucket Pipelines.

```
bb pipeline list                                      # List recent pipelines
bb pipeline get <pipeline-id>                         # Get details of a specific pipeline
bb pipeline latest                                    # Get details of the latest pipeline
bb pipeline wait <pipeline-id>                        # Poll until the pipeline finishes (live status updates)
                                                      # Flag: --timeout <seconds> (default: 3600)
                                                      # Exits with code 1 if timeout is reached
bb pipeline run <branch>                              # Trigger the default pipeline for a branch
bb pipeline custom <branch> <pipeline-name>           # Trigger a custom pipeline by name for a branch
```

**`bb pipeline list` output columns**: pipeline number, branch, trigger, state, result, created date, duration

**`bb pipeline wait`** polls every 5 seconds and prints live status until the pipeline state is `COMPLETED`, `FAILED`, or `STOPPED`.

---

### `bb env`

Manage Bitbucket Deployment Environments and their variables.

```
bb env list                                              # List all deployment environments
bb env list                                                            # List all deployment environments
bb env variables <env-uuid>                                            # List all variables for an environment
bb env variables --env-name <name>                                     # Same, but looks up the env UUID by name automatically
bb env create-variable <env-uuid> <key> <value> [--secured]           # Create an environment variable
                                                                       # If the variable already exists, prompts to confirm override
bb env update-variable <env-uuid> <var-uuid> <key> <value> [--secured] # Update an environment variable
                                                                       # If the variable does not exist, warns and aborts
bb env delete-variable <env-uuid> <var-uuid>                           # Delete an environment variable
                                                                       # Prompts for confirmation; use --yes to skip

**Notes**:
- `--secured` flag marks the variable as secured (value hidden after creation)
- `bb env list` output columns: name, UUID, environment type

---

### `bb browse`

Open Bitbucket pages in the default browser.

```
bb browse repo          # Open the repository homepage
bb browse prs           # Open pull requests page
bb browse pipelines     # Open pipelines page
bb browse branch [name] # Open current or given branch on Bitbucket
bb browse pr <pr-id>    # Open a specific PR in the browser
```

---

## Configuration Resolution

The CLI resolves workspace and repo slug from `~/.bb-cli-config.json` only. If the file is missing or incomplete, the user is prompted to run `bb auth save`.

---

## Error Handling

- API errors (4xx, 5xx) print a human-readable message including the HTTP status and Bitbucket error message.
- A 401 response explicitly distinguishes between invalid credentials and an expired token: if the token expiry date is past, the message reads `"Your API token has expired. Generate a new one and run 'bb auth save'."` otherwise `"Authentication failed. Check your credentials with 'bb auth show'."`.
- If auth config is missing, prompt the user to run `bb auth`.
- If workspace/repo cannot be resolved, print a clear error and suggest running `bb auth save`.
- Network errors are caught and displayed with a suggestion to check connectivity.
- `bb pr create` aborts with an error if the source branch has no commits ahead of the destination branch.
- `bb pipeline wait` exits with code 1 if the timeout is reached before the pipeline completes.
- Commands that return empty results (e.g. `bb pr list` with no open PRs) exit with code 0 and print a friendly message such as `"No open PRs found."`.
- All other unexpected errors exit with code 1.

---

## Output Modes

Every command routes its output through a single style, selected via the `--output-style` flag or the saved default. Three styles are supported:

- **`normal`** (default): Formatted, colored table output using `cli-table3` and `chalk`. Designed for human terminal use.
- **`json`**: Raw JSON to stdout. Suitable for piping into `jq` or any other JSON-aware tool.
- **`ai`**: Minimal, token-efficient plain text. No box borders, no padding, no color codes — every character carries meaning. Designed to be piped into an LLM or parsed with simple tools like `awk` or `cut`.

### Resolution order

The active style for any command invocation is resolved in this order (first match wins):

1. `--output-style <style>` flag — per-invocation override
2. `output_style` field in `~/.bb-cli-config.json` — saved default
3. `normal` — built-in fallback

---

## Shell Autocomplete

The CLI should support shell autocompletion generation for:

- **bash**: `bb completion bash >> ~/.bashrc`
- **zsh**: `bb completion zsh >> ~/.zshrc`
- **fish**: `bb completion fish > ~/.config/fish/completions/bb.fish`

Autocomplete should suggest: subcommands, flags, branch names, PR IDs, pipeline IDs, and environment UUIDs where applicable.

---

## Installation

### Via npm

```bash
npm install -g @yourname/bb-cli
```

### Standalone binary

Pre-built binaries for Linux, macOS, and Windows will be published to GitHub Releases. Download and move to PATH:

```bash
curl -L https://github.com/yourname/bb-cli/releases/latest/download/bb-linux -o /usr/local/bin/bb
chmod +x /usr/local/bin/bb
```

### Docker

```bash
docker run -it --rm \
  --mount type=bind,source="$HOME/.bb-cli-config.json",target=/root/.bb-cli-config.json \
  --mount type=bind,source="$(pwd)",target=/workdir,readonly \
  yourname/bb-cli help
```

---


