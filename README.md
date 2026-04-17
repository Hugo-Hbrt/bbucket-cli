# bb — Bitbucket CLI

[![npm version](https://img.shields.io/npm/v/@hugo-hebert/bbucket-cli.svg)](https://www.npmjs.com/package/@hugo-hebert/bbucket-cli)
[![npm downloads](https://img.shields.io/npm/dm/@hugo-hebert/bbucket-cli.svg)](https://www.npmjs.com/package/@hugo-hebert/bbucket-cli)
[![license](https://img.shields.io/npm/l/@hugo-hebert/bbucket-cli.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@hugo-hebert/bbucket-cli.svg)](https://nodejs.org)

A command-line interface for Bitbucket Cloud. Manage branches, pull requests,
pipelines, and deployment environments without leaving the terminal.

<p align="center">
  <img src="docs/bb-demo.gif" alt="bb CLI demo — pr view, pipeline wait, env variables" width="800">
</p>

📖 **Full documentation**: <https://hugo-hbrt.github.io/bbucket-cli/>

## Install

```bash
npm install -g @hugo-hebert/bbucket-cli
```

Or run without installing:

```bash
npx @hugo-hebert/bbucket-cli auth
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
app.

The `email` field is your **Atlassian account email**, not your Bitbucket
username.

## Output styles

Every command supports `--output-style <normal|json|ai>`:

- `normal` — formatted, colored table (default)
- `json` — raw JSON for piping into `jq`
- `ai` — minimal, token-efficient plain text for LLMs or `awk`/`cut`

Set a persistent default with `bb option --output-style ai`.

## Status

Work in progress. See the [docs site](https://hugo-hbrt.github.io/bbucket-cli/) for full guides and command reference.

## License

[MIT](./LICENSE)
