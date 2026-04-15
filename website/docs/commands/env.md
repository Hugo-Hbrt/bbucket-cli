---
sidebar_position: 5
---

# bb env

Manage deployment environments and their variables.

## `bb env list`

List all deployment environments configured for the repo.

```bash
bb env list
```

Columns: name, UUID, environment type (Production / Staging / Test / custom).

## `bb env variables <env-uuid>`

List all variables for an environment. Secured variables show `****` in the table (Bitbucket redacts the value server-side; nothing is leaked).

```bash
bb env variables {prod-uuid}
```

### Look up by name instead of UUID

```bash
bb env variables --env-name Production
```

Fetches the environments list, finds the matching name, and forwards to the UUID lookup. Errors with a friendly message if the name doesn't match any environment.

## `bb env create-variable <env-uuid> <key> <value>`

Create a new variable.

```bash
bb env create-variable {prod-uuid} API_URL https://api.example.com
bb env create-variable {prod-uuid} API_TOKEN "$SECRET" --secured
```

**`--secured`** — mark the variable as secured (value hidden after creation).

If the key **already exists** in the environment, `bb` prompts to confirm an override. Confirm → `PUT` to update. Decline → exits with "Cancelled".

## `bb env update-variable <env-uuid> <var-uuid> <key> <value>`

Update an existing variable by its UUID. The `key` can differ from the current key (effectively renames it).

```bash
bb env update-variable {prod-uuid} {var-uuid} API_URL https://new.example.com
```

Errors cleanly if the `var-uuid` doesn't exist in the given environment.

## `bb env delete-variable <env-uuid> <var-uuid>`

Delete a variable. Prompts for confirmation.

```bash
bb env delete-variable {prod-uuid} {var-uuid}
bb env delete-variable {prod-uuid} {var-uuid} --yes
```

## Getting UUIDs

The table output shows UUIDs, but you can grab them programmatically with `--output-style json`:

```bash
bb env list --output-style json | jq '.[] | select(.name == "Production") | .uuid'
bb env variables {prod-uuid} --output-style json | jq '.[] | {key, uuid}'
```
