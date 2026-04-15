---
sidebar_position: 4
---

# bb pipeline

Trigger, inspect, and wait on Bitbucket Pipelines.

## `bb pipeline list`

List recent pipelines (paginated, newest first). Columns: number, branch, trigger, state, result, created, duration.

```bash
bb pipeline list
```

## `bb pipeline latest`

Show the most recent pipeline as a vertical detail view. Uses `?sort=-created_on&pagelen=1` so it's a single HTTP call.

```bash
bb pipeline latest
```

Prints `No pipelines found.` and exits `0` on an empty repo.

## `bb pipeline run <branch>`

Trigger the **default** pipeline for a branch.

```bash
bb pipeline run main
bb pipeline run feature/login
```

POST body:

```json
{
  "target": {
    "type": "pipeline_ref_target",
    "ref_type": "branch",
    "ref_name": "main"
  }
}
```

Response shows the new pipeline's build number.

## `bb pipeline custom <branch> <name>`

Trigger a **named custom** pipeline defined in `bitbucket-pipelines.yml`.

```bash
bb pipeline custom main nightly-build
```

Adds a `selector: { type: "custom", pattern: <name> }` to the target.

## `bb pipeline wait <uuid>`

Block the terminal until the pipeline reaches a terminal state. Polls every 5 seconds.

```bash
bb pipeline wait {abc-uuid}
bb pipeline wait {abc-uuid} --timeout 1800   # wait up to 30 minutes
```

**`--timeout <seconds>`** — default 3600 (one hour). Exits `1` with a friendly error if the timeout fires before the pipeline reaches `completed`, `stopped`, or `halted`.

### Getting a UUID

`bb pipeline list` shows build numbers in the table, but `wait` expects the UUID. Get it from JSON mode:

```bash
bb pipeline list --output-style json | jq '.[0].uuid'
```

Or use the latest pipeline directly:

```bash
bb pipeline wait "$(bb pipeline latest --output-style json | jq -r .uuid)"
```
