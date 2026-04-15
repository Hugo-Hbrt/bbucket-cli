---
sidebar_position: 2
---

# bb branch

List, filter, and delete repository branches.

## `bb branch list`

List all branches in the default repo, sorted by most recently updated.

```bash
bb branch list
```

**Columns**: name, short commit hash, author, updated date.

Server-side sort is `-target.date` with `pagelen=100`.

## `bb branch name <filter>`

Filter by branch name substring.

```bash
bb branch name feature        # all branches whose name contains "feature"
```

## `bb branch user <filter>`

Filter by the author of the latest commit.

```bash
bb branch user "Jane Doe"
```

## `bb branch delete <name>`

Delete a branch from the remote. Prompts for confirmation.

```bash
bb branch delete feature/old
bb branch delete feature/old --yes    # skip the prompt
```

**`--yes` / `-y`** — skip the interactive confirmation. Use in scripts only.

## Notes

- Long commit-author names or long branch names wrap inside table cells (`colWidths: [50, 9, 20, 12]`).
- Non-linked authors (commits from CI bots or external contributors whose email isn't a Bitbucket user) still show correctly — we fall back to the parsed `raw` field.
