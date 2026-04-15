---
sidebar_position: 7
---

# bb option

Manage persistent CLI preferences stored alongside your auth config in `~/.bb-cli-config.json`.

## `bb option --output-style <style>`

Set the default output style for every command. Values: `normal`, `json`, `ai`.

```bash
bb option --output-style ai        # feed every command's output to LLMs by default
bb option --output-style json      # scripting-first
bb option --output-style normal    # back to tables
```

The value is persisted as `output_style` in the config file.

## `bb option show`

Display the current preferences.

```bash
bb option show
# output-style: ai
```

## Validation

If you hand-edit `~/.bb-cli-config.json` and set `output_style` to something invalid (e.g. `"banana"`), every command will refuse to run with:

```
Error: Invalid ~/.bb-cli-config.json: output_style must be one of normal, json, ai (got "banana")
```

This parse-time check lives in the config reader — invalid values can never reach the command layer.

## See also

- [Output styles guide](../output-styles) — when to use each style, resolution order
