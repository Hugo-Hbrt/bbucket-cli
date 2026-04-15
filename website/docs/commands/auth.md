---
sidebar_position: 1
---

# bb auth

Manage Bitbucket authentication credentials stored at `~/.bb-cli-config.json`.

## `bb auth` / `bb auth save`

Interactive flow that prompts for:

- Atlassian account email
- API token (input masked)
- Default workspace slug
- Default repo slug

Pre-fills existing values if a config already exists — useful for rotating the token without re-typing email/workspace/repo.

```bash
bb auth
bb auth save    # explicit alias
```

## `bb auth show`

Print the saved config. The API token is always masked as `****` — the raw value is never displayed.

```bash
bb auth show
# Config file: /Users/you/.bb-cli-config.json
# Email:       you@example.com
# Token:       ****
# Workspace:   my-workspace
# Repo slug:   my-repo
```

With `--output-style json`:

```json
{
  "email": "you@example.com",
  "apiToken": "****",
  "workspace": "my-workspace",
  "repoSlug": "my-repo"
}
```

## See also

- [Authentication guide](../authentication) — creating the API token, required scopes, 401 troubleshooting
