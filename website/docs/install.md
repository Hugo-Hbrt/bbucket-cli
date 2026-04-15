---
sidebar_position: 2
---

# Install

`bb` ships as an npm package. It requires **Node.js ≥ 18**.

## Global install (recommended)

```bash
npm install -g @hugo-hebert/bbucket-cli
```

After this, `bb` is on your `PATH`:

```bash
bb --version
bb --help
```

## Run without installing

You can use `npx` to run any command without adding the package globally:

```bash
npx @hugo-hebert/bbucket-cli auth
npx @hugo-hebert/bbucket-cli branch list
```

The first invocation downloads the package into the npx cache (~1 second); subsequent runs are instant.

## Verify the installation

```bash
bb --version
# → @hugo-hebert/bbucket-cli/0.1.0 darwin-arm64 node-v24.3.0

bb --help
# → Lists every topic (auth, branch, pr, pipeline, env, browse, option)
```

## Next step

You need to save credentials before any command that talks to Bitbucket will work. Continue to the [authentication guide](./authentication).
