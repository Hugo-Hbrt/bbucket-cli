# bb — Product Features

Features are ordered by recommended implementation sequence: foundational setup first, read-only commands next, write and destructive actions after, finishing with cross-cutting concerns.

---

## Phase 1 — Foundation

### 1. Authentication Setup

Save your Bitbucket credentials so the tool can connect to your account. The token is stored locally and masked whenever displayed.

**User flow:**
1. User runs `bb auth`
2. They are prompted step-by-step for their Atlassian email, API token, workspace, and default repository
3. Credentials are saved locally
4. User can verify what is saved at any time with `bb auth show` (token appears as `****`)

---

### 2. JSON Output Mode

Output the raw data from any command as JSON, for scripting and piping to other tools.

**User flow:**
1. User appends `--json` to any command
2. The result is printed as raw JSON instead of a formatted table, suitable for piping to tools like `jq`

---

## Phase 2 — Read-only Commands

### 3. Branch Listing & Filtering

Browse all branches in the repository, with optional filters by name or author. Results are sorted by most recently updated.

**User flow:**
1. User runs `bb branch list` to see all branches
2. Optionally, they filter by branch name with `bb branch name <filter>` or by commit author with `bb branch user <filter>`
3. A table is displayed showing branch name, latest commit, author, and date

---

### 4. Pull Request Listing

List pull requests in the repository, with filtering by destination branch and state.

**User flow:**
1. User runs `bb pr list` to see all open PRs
2. Optionally filters by destination branch (e.g. `bb pr list main`) or by state using `--state` (open, merged, declined, superseded)
3. A table is displayed showing PR ID, title, author, source → destination branch, status, and creation date

---

### 5. Pull Request Details

View the full details of a specific pull request.

**User flow:**
1. User runs `bb pr view <pr-id>`
2. A detailed view is shown including title, description, reviewers and their statuses, commit count, and comment count

---

### 6. Pull Request Diff

View the full diff of a pull request directly in the terminal, with support for piping to other tools.

**User flow:**
1. User runs `bb pr diff <pr-id>`
2. The diff is printed to the terminal
3. Optionally, the user pipes the output to a file, a text editor, or another command (e.g. `bb pr diff 42 | less`)

---

### 7. Pull Request Commits

List all commits included in a pull request.

**User flow:**
1. User runs `bb pr commits <pr-id>`
2. A list of commits is displayed for that PR

---

### 8. Pull Request Comments

List all comments on a pull request, including both inline code comments and general comments.

**User flow:**
1. User runs `bb pr comments <pr-id>`
2. All comments (inline and general) are displayed

---

### 9. Pipeline Listing

View recent pipeline runs for the repository.

**User flow:**
1. User runs `bb pipeline list`
2. A table is displayed showing pipeline number, branch, trigger, state, result, date, and duration

---

### 10. Latest Pipeline

Quickly check the status of the most recent pipeline run.

**User flow:**
1. User runs `bb pipeline latest`
2. The details of the latest pipeline are displayed

---

### 11. Environment Listing

List all deployment environments configured for the repository.

**User flow:**
1. User runs `bb env list`
2. A table is displayed showing environment name, UUID, and type

---

### 12. Environment Variable Listing

List all variables for a specific deployment environment, with a name-based lookup option.

**User flow:**
1. User runs `bb env variables <env-uuid>` or uses `--env-name <n>` to look up the environment by name instead of UUID
2. All variables for that environment are listed (secured values are hidden)

---

## Phase 3 — Write Actions

### 13. Pull Request Creation

Create a new pull request from one branch to another, with an interactive or scripted flow.

**User flow:**
1. User runs `bb pr create <source-branch> <destination-branch>`
2. If the source branch has no commits ahead of the destination, the tool aborts with a clear error
3. If `--title` is not provided, the user is prompted to enter a title interactively
4. Optionally, a description can be provided via `--description` or entered interactively
5. The PR is created and the user receives a confirmation with the PR ID

---

### 14. Pull Request Checkout

Check out the source branch of a pull request locally, to review or test it.

**User flow:**
1. User runs `bb pr checkout <pr-id>`
2. The tool fetches the source branch of that PR and checks it out in the local git repository

---

### 15. Pull Request Review Actions

Approve, remove approval, request changes, or remove a change request on a PR.

**User flow:**
1. User runs one of: `bb pr approve`, `bb pr no-approve`, `bb pr request-changes`, or `bb pr no-request-changes` with a PR ID
2. The corresponding review status is applied immediately
3. The tool confirms the action

---

### 16. Pipeline Trigger (Default)

Trigger the default pipeline for a given branch.

**User flow:**
1. User runs `bb pipeline run <branch>`
2. The pipeline is triggered and the tool confirms

---

### 17. Pipeline Trigger (Custom)

Trigger a specific named custom pipeline for a given branch.

**User flow:**
1. User runs `bb pipeline custom <branch> <pipeline-name>`
2. The named pipeline is triggered for that branch and the tool confirms

---

### 18. Pipeline Wait

Block the terminal and wait for a specific pipeline to finish, with live status updates and a configurable timeout.

**User flow:**
1. User runs `bb pipeline wait <pipeline-id>`, optionally with `--timeout <seconds>` (default: 1 hour)
2. The tool polls every 5 seconds and updates the status in place in the terminal
3. When the pipeline completes, the final result is shown and the tool exits
4. If the timeout is reached before completion, the tool exits with an error

---

### 19. Environment Variable Creation

Create a new variable in a deployment environment, with optional secured flag.

**User flow:**
1. User runs `bb env create-variable` with an environment, key, and value
2. If the variable already exists, the tool prompts the user to confirm overriding it
3. The variable is created, and if marked as secured, the value is hidden from that point on

---

### 20. Environment Variable Update

Update an existing variable in a deployment environment.

**User flow:**
1. User runs `bb env update-variable` with the environment, variable reference, new key, and new value
2. If the variable does not exist, the tool warns and aborts
3. Otherwise, the variable is updated

---

## Phase 4 — Destructive Actions

### 21. Pull Request Merge

Merge a pull request with a configurable merge strategy.

**User flow:**
1. User runs `bb pr merge <pr-id>`
2. Optionally passes `--strategy` to choose between merge commit, squash, or fast-forward (defaults to merge commit)
3. The PR is merged and the tool confirms

---

### 22. Pull Request Decline

Decline a pull request, closing it without merging.

**User flow:**
1. User runs `bb pr decline <pr-id>`
2. The PR is declined and the tool confirms

---

### 23. Branch Deletion

Delete a branch from the repository with a safety confirmation step.

**User flow:**
1. User runs `bb branch delete <branch-name>`
2. The tool prompts for confirmation before proceeding
3. User confirms (or passes `--yes` to skip the prompt)
4. The branch is deleted

---

### 24. Environment Variable Deletion

Delete a variable from a deployment environment, with a confirmation step.

**User flow:**
1. User runs `bb env delete-variable` with the environment and variable reference
2. The tool prompts for confirmation before deleting (pass `--yes` to skip)
3. The variable is deleted

---

## Phase 5 — Quality of Life

### 25. Browser Navigation

Open relevant Bitbucket pages directly in the default browser from the terminal.

**User flow:**
1. User runs one of: `bb browse repo`, `bb browse prs`, `bb browse pipelines`, `bb browse branch [name]`, or `bb browse pr <pr-id>`
2. The corresponding Bitbucket page opens in the browser immediately

---

### 26. Shell Autocomplete

Enable tab completion for all commands, subcommands, and flags in the user's shell.

**User flow:**
1. User runs the appropriate completion command for their shell (bash, zsh, or fish)
2. They follow the one-line instruction to add it to their shell config
3. From that point on, pressing Tab completes commands, subcommands, and flags automatically
