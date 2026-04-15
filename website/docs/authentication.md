---
sidebar_position: 3
---

# Authentication

Bitbucket Cloud deprecated app passwords in favour of **Atlassian API tokens**. App passwords stop working entirely on **June 9, 2026**. `bb` uses API tokens exclusively.

## Create an API token

1. Log in to Atlassian.
2. Go to **Settings → Security → Create and manage API tokens**.
3. Click **Create API token with scopes**.
4. Name the token, set an expiry date, select **Bitbucket** as the app.
5. Assign the scopes listed below.
6. **Copy the token immediately** — it's only shown once.

### Required scopes

| Scope | Reason |
|---|---|
| `Repositories: Read` | `bb branch list`, repo info |
| `Pull requests: Read` | `bb pr list/view/diff/commits/comments` |
| `Pull requests: Write` | `bb pr create/merge/decline/approve` |
| `Pipelines: Read` | `bb pipeline list/latest/wait` |
| `Pipelines: Write` | `bb pipeline run/custom` |
| `Variables: Read` | `bb env variables` |
| `Variables: Write` | `bb env create-variable/update-variable/delete-variable` |

You can scope tokens to a single workspace at creation time for tighter security.

## Save your credentials

```bash
bb auth
```

This interactive flow prompts for:

- **Atlassian account email** — your Atlassian login, **not** your Bitbucket username. Find it at *Bitbucket → Avatar → Personal settings → Email aliases*.
- **API token** — paste the token you just created. It's masked as you type.
- **Workspace** — the Bitbucket workspace slug (the first segment of `bitbucket.org/{workspace}/{repo}`).
- **Default repo slug** — the repo inside that workspace.

The values are persisted to `~/.bb-cli-config.json` with file mode **0600** (owner read/write only). No other process on your machine can read the token.

## Verify

```bash
bb auth show
```

Prints your saved configuration with the token masked as `****`.

## Troubleshoot 401 errors

If any command returns `401 Unauthorized: Token is invalid, expired, or not supported for this endpoint`, three things to check:

1. **Email is your Atlassian email**, not your Bitbucket username. This is the most common mistake.
2. **Token has the right scopes**. If you used the old "Create API token" flow (no scopes), regenerate via **Create API token with scopes**.
3. **Token hasn't expired**. Check expiry on Atlassian → Security → API tokens.

Test credentials directly with curl to remove the CLI from the equation:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -u "YOUR_EMAIL:YOUR_TOKEN" \
  https://api.bitbucket.org/2.0/user
```

A `200` means the credentials are fine and the issue is scope-specific.

## Rotate or update credentials

Just re-run `bb auth` — it re-prompts for every field, pre-filled with the existing values so you can update one at a time.
