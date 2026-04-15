---
sidebar_position: 6
---

# bb browse

Open Bitbucket pages in your default browser. Useful when the terminal output isn't enough and you want the full web UI.

Uses the platform's native opener (`open` on macOS, `xdg-open` on Linux, `start` on Windows).

## `bb browse repo`

Opens the repository homepage.

```bash
bb browse repo
# → https://bitbucket.org/{workspace}/{repo}
```

## `bb browse prs`

Opens the pull requests page.

```bash
bb browse prs
# → https://bitbucket.org/{workspace}/{repo}/pull-requests/
```

## `bb browse pipelines`

Opens the pipelines dashboard.

```bash
bb browse pipelines
# → https://bitbucket.org/{workspace}/{repo}/addon/pipelines/home
```

## `bb browse branch [name]`

Open a branch's page. Without an argument, uses the current local git branch (`git rev-parse --abbrev-ref HEAD`).

```bash
bb browse branch feature/login
bb browse branch                    # current branch
```

## `bb browse pr <id>`

Open a specific pull request.

```bash
bb browse pr 42
# → https://bitbucket.org/{workspace}/{repo}/pull-requests/42
```
