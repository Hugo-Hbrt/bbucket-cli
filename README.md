# bb — Bitbucket CLI

A command-line interface for Bitbucket Cloud. Manage branches, pull requests,
pipelines, and deployment environments without leaving the terminal.

## Install

```bash
npm install -g @hugo-hbrt/bbucket-cli
```

Or run without installing:

```bash
npx @hugo-hbrt/bbucket-cli auth
```

## Quick start

```bash
bb auth                       # save your Atlassian email + API token
bb branch list                # list branches, newest first
bb pr list                    # list open pull requests
bb pr view 42                 # show a PR's details
bb pipeline list              # list recent pipelines
bb --help                     # everything else
```

## Authentication

`bb` uses **Atlassian API tokens** (app passwords are deprecated by Bitbucket
in June 2026). Create one at **Atlassian Settings → Security → Create and
manage API tokens → Create API token with scopes**, select *Bitbucket* as the
app, and grant the scopes listed in [`spec.md`](./spec.md#required-scopes).

The `email` field is your **Atlassian account email**, not your Bitbucket
username.

## Output styles

Every command supports `--output-style <normal|json|ai>`:

- `normal` — formatted, colored table (default)
- `json` — raw JSON for piping into `jq`
- `ai` — minimal, token-efficient plain text for LLMs or `awk`/`cut`

Set a persistent default with `bb option --output-style ai`.

## Status

Work in progress. Full documentation site coming soon.

## License

[MIT](./LICENSE)
