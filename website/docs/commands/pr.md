---
sidebar_position: 3
---

# bb pr

Manage pull requests: list, view, create, review, merge, decline, and more.

## Read-only

### `bb pr list [branch]`

List pull requests. Optional positional arg filters by destination branch.

```bash
bb pr list                        # all open PRs
bb pr list main                   # PRs targeting main
bb pr list --state merged         # merged PRs
```

**`--state <open|merged|declined|superseded>`** — default `open`.

### `bb pr view <id>`

Full detail view: title, description, reviewers and their statuses, comment count, commit count.

```bash
bb pr view 42
```

The detail call makes two parallel HTTP requests (`Promise.all`): one for the PR, one for `/commits?pagelen=1` to read the total count from the pagination envelope.

### `bb pr diff <id>`

Raw unified diff to stdout. Pipe-safe.

```bash
bb pr diff 42 | less
bb pr diff 42 > /tmp/pr.patch
bb pr diff 42 | patch -p1
```

### `bb pr commits <id>`

List every commit in the PR with pagination. Table shows short hash, author, date, and the first line of each commit message (like `git log --oneline`).

### `bb pr comments <id>`

List all comments — both general and inline code comments — with pagination (`fetchAllPages` with `pagelen=100`).

**`--unresolved`** — show only unresolved threads.
**`--resolved`** — show only resolved threads. Mutually exclusive with `--unresolved`.

Inline comments are prefixed `[path:line]` in the table. Comments longer than 1000 characters are truncated with `…` to keep the table render fast — JSON mode preserves the full content.

## Write actions

### `bb pr create <source> <destination>`

Create a new PR. Aborts early with a friendly error if the source branch has zero commits ahead of the destination (pre-flight check via `GET /commits?include=source&exclude=destination`).

```bash
bb pr create feature/login main --title "Add login page"
bb pr create feature/login main                        # prompts for title
```

**`--title <title>`** — if omitted, prompts interactively.
**`--description <desc>`** — optional.

### `bb pr checkout <id>`

Fetch the source branch of a PR locally and check it out. Shells out to `git fetch origin <branch>` followed by `git checkout <branch>`.

```bash
bb pr checkout 42
```

### Review actions

Four paired commands:

```bash
bb pr approve 42                  # POST /approve
bb pr no-approve 42               # DELETE /approve
bb pr request-changes 42          # POST /request-changes
bb pr no-request-changes 42       # DELETE /request-changes
```

### `bb pr merge <id>`

Merge the PR. Default strategy is `merge` (produces a merge commit).

```bash
bb pr merge 42
bb pr merge 42 --strategy squash
bb pr merge 42 --strategy fast-forward
```

### `bb pr decline <id>`

Close the PR without merging.

```bash
bb pr decline 42
```
