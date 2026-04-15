---
sidebar_position: 1
slug: /
---

# Introduction

`bb` is a command-line interface for **Bitbucket Cloud**. It wraps the Bitbucket REST API so you can manage branches, pull requests, pipelines, and deployment environments directly from the terminal — without opening a browser.

## Why another CLI?

The official Bitbucket web UI is slow when you just want to glance at a PR, trigger a pipeline, or rotate a secured env var. Switching contexts from editor → terminal → browser → back to editor adds up.

`bb` collapses that back into the terminal:

```bash
bb branch list                           # what's in flight?
bb pr view 42                            # quick look at a PR
bb pr comments 42 --unresolved           # open review threads only
bb pipeline run main                     # kick off a build
bb env variables --env-name Production   # inspect prod config
```

## Design principles

- **Small surface, clean output.** Each command does one thing, and every command respects the global `--output-style` flag so you can pick `normal` (human-readable tables), `json` (for piping into `jq`), or `ai` (minimal, token-efficient text for LLMs).
- **Local-first.** Your Atlassian API token lives at `~/.bb-cli-config.json` (mode 600). No cloud component, no telemetry.
- **Scriptable.** Every command returns sensible exit codes and can be piped safely.
- **Testable.** `bb` is built with clean architecture — domain logic is isolated from HTTP, git, and the terminal. The full acceptance test suite runs against a fake Bitbucket server so every behaviour is locked in.

## What's next

Head to the [install guide](./install) to get `bb` on your machine, then set up credentials in the [authentication guide](./authentication).
