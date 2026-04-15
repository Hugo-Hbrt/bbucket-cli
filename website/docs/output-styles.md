---
sidebar_position: 4
---

# Output styles

Every command routes its output through a single style, controllable via the `--output-style` flag:

```bash
bb pr list --output-style normal    # default, colored table
bb pr list --output-style json      # raw JSON for jq
bb pr list --output-style ai        # minimal plain text for LLMs
```

## The three styles

### `normal` — for humans

Formatted, colored tables via `cli-table3` + `chalk`. The default.

```
┌────┬──────────────────┬──────────┬────────────────────┬───────┬────────────┐
│ ID │ Title            │ Author   │ Branches           │ State │ Created    │
├────┼──────────────────┼──────────┼────────────────────┼───────┼────────────┤
│ 42 │ Add login page   │ Jane Doe │ feature/login → main│ open  │ 2026-03-20 │
└────┴──────────────────┴──────────┴────────────────────┴───────┴────────────┘
```

### `json` — for scripts

Raw JSON to stdout. Every command emits whatever the command's domain type serializes to, with no wrapping envelope:

```bash
$ bb pr list --output-style json | jq '.[] | .title'
"Add login page"
"Refactor auth"
```

### `ai` — for LLMs and `awk`/`cut`

Minimal, token-efficient plain text. No box borders, no padding, no color codes — every character carries meaning. Tab-separated, one row per line.

```
$ bb pr list --output-style ai
42	Add login page
37	Refactor auth
```

Pipe it straight into an LLM:

```bash
bb pr view 42 --output-style ai | llm "summarise this PR"
```

Or parse it with shell tools:

```bash
bb branch list --output-style ai | awk '{print $1}'   # branch names
```

## Set a persistent default

If you always want JSON or AI mode, save it:

```bash
bb option --output-style ai
```

This writes `output_style: "ai"` into `~/.bb-cli-config.json`. Every subsequent command defaults to that style unless you pass `--output-style` explicitly.

Check the current setting:

```bash
bb option show
```

## Resolution order

The active style for any command invocation is resolved in this order (first match wins):

1. `--output-style` flag — per-invocation override
2. `output_style` field in `~/.bb-cli-config.json` — saved default
3. `normal` — built-in fallback

## Why `ai` exists

Feeding `bb pr view 42 --output-style ai` into an LLM takes roughly 5× fewer tokens than the human-readable `normal` output (no box-drawing, no padding, compact key=value pairs). If you use LLMs in your dev loop, this matters.
