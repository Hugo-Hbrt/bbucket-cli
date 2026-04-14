import { strict as assert } from "node:assert";
import { after, before, beforeEach, describe, test } from "node:test";

import { createSandbox } from "./helpers/cli.js";

let sandbox;

before(async () => {
  sandbox = await createSandbox();
  await sandbox.writeConfig({
    email: "test@example.com",
    api_token: "test-token",
    workspace: "my-ws",
    repo_slug: "my-repo",
  });
});

after(async () => {
  await sandbox.destroy();
});

beforeEach(async () => {
  // re-write config in case previous tests overwrote it
  await sandbox.writeConfig({
    email: "test@example.com",
    api_token: "test-token",
    workspace: "my-ws",
    repo_slug: "my-repo",
  });
});

describe("bb browse", () => {
  test("repo opens the repository homepage", async () => {
    const { code } = await sandbox.runCli(["browse", "repo"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.includes("https://bitbucket.org/my-ws/my-repo"));
  });

  test("prs opens the pull requests page", async () => {
    const { code } = await sandbox.runCli(["browse", "prs"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.some((url) => url.endsWith("/pull-requests/")));
  });

  test("pipelines opens the pipelines page", async () => {
    const { code } = await sandbox.runCli(["browse", "pipelines"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.some((url) => url.includes("/addon/pipelines/home")));
  });

  test("branch <name> opens a specific branch page", async () => {
    const { code } = await sandbox.runCli(["browse", "branch", "feature/login"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.some((url) => url.includes("/branch/feature%2Flogin")));
  });

  test("branch with no name uses the current git branch", async () => {
    await sandbox.useFakeGit();
    const { code } = await sandbox.runCli(["browse", "branch"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.some((url) => url.includes("/branch/test-branch")));
  });

  test("pr <id> opens a specific PR", async () => {
    const { code } = await sandbox.runCli(["browse", "pr", "42"]);
    assert.equal(code, 0);
    const calls = await sandbox.browseCalls();
    assert.ok(calls.some((url) => url.endsWith("/pull-requests/42")));
  });
});
