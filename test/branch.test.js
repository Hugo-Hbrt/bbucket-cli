import { strict as assert } from "node:assert";
import { after, before, beforeEach, describe, test } from "node:test";

import { startFakeBitbucket } from "./helpers/bitbucket.js";
import { createSandbox } from "./helpers/cli.js";

let sandbox;
let bitbucket;

before(async () => {
  sandbox = await createSandbox();
  bitbucket = await startFakeBitbucket();
  await sandbox.writeConfig({
    email: "test@example.com",
    api_token: "test-token",
    workspace: "my-ws",
    repo_slug: "my-repo",
    api_base_url: bitbucket.url,
  });
});

after(async () => {
  await bitbucket.stop();
  await sandbox.destroy();
});

beforeEach(() => {
  bitbucket.reset();
});

const BRANCHES_ENDPOINT = "/2.0/repositories/my-ws/my-repo/refs/branches";

function stubBranches(values) {
  bitbucket.stub("GET", BRANCHES_ENDPOINT, { body: { values } });
}

function branchFixture({
  name = "main",
  hash = "abc123def456789",
  date = "2026-04-14T10:00:00Z",
  author = "Alice",
  authorLinked = true,
} = {}) {
  const raw = `${author} <${author.toLowerCase().replace(/\s/g, ".")}@example.com>`;
  const authorField = authorLinked ? { raw, user: { display_name: author } } : { raw };
  return {
    name,
    target: { hash, date, author: authorField },
  };
}

describe("bb branch list", () => {
  test("prints the name of a single branch returned by the API", async () => {
    stubBranches([branchFixture({ name: "main" })]);

    const { code, stdout } = await sandbox.runCli(["branch", "list"]);

    assert.equal(code, 0, `expected exit 0, stderr: ${stdout}`);
    assert.match(stdout, /main/);
  });

  test("lists multiple branches with the most recently updated first", async () => {
    stubBranches([
      branchFixture({ name: "stale", date: "2026-01-01T00:00:00Z" }),
      branchFixture({ name: "fresh", date: "2026-04-14T12:00:00Z" }),
    ]);

    const { stdout } = await sandbox.runCli(["branch", "list"]);

    assert.ok(
      stdout.indexOf("fresh") < stdout.indexOf("stale"),
      `fresh should appear before stale, got:\n${stdout}`,
    );
  });

  test("shows short hash, author, and commit date for each branch", async () => {
    stubBranches([
      branchFixture({
        name: "feature",
        hash: "abc123def4567890",
        date: "2026-03-20T15:30:00Z",
        author: "Jane Doe",
      }),
    ]);

    const { stdout } = await sandbox.runCli(["branch", "list"]);

    assert.match(stdout, /abc123d/, "short commit hash (7 chars) should be shown");
    assert.match(stdout, /Jane Doe/, "commit author should be shown");
    assert.match(stdout, /2026-03-20/, "commit date should be shown");
    assert.doesNotMatch(stdout, /abc123def4567890/, "full hash should NOT be shown");
  });

  test("falls back to parsed raw author when commit has no linked Bitbucket user", async () => {
    stubBranches([branchFixture({ name: "bot-branch", author: "CI Bot", authorLinked: false })]);

    const { code, stdout } = await sandbox.runCli(["branch", "list"]);

    assert.equal(code, 0, `expected exit 0, got:\n${stdout}`);
    assert.match(stdout, /bot-branch/);
    assert.match(stdout, /CI Bot/);
  });

  test("--json returns branch objects with name, commitHash, author, updatedAt", async () => {
    stubBranches([
      branchFixture({
        name: "feature",
        hash: "abc123def4567890",
        date: "2026-03-20T15:30:00Z",
        author: "Jane Doe",
      }),
    ]);

    const { code, stdout } = await sandbox.runCli(["branch", "list", "--json"]);
    const parsed = JSON.parse(stdout);

    assert.equal(code, 0);
    assert.deepEqual(parsed, [
      {
        name: "feature",
        commitHash: "abc123def4567890",
        author: "Jane Doe",
        updatedAt: "2026-03-20T15:30:00.000Z",
      },
    ]);
  });
});

describe("bb branch name <filter>", () => {
  test("only includes branches whose name contains the filter substring", async () => {
    stubBranches([
      branchFixture({ name: "feature/login" }),
      branchFixture({ name: "main" }),
      branchFixture({ name: "feature/signup" }),
    ]);

    const { stdout } = await sandbox.runCli(["branch", "name", "feature"]);

    assert.match(stdout, /feature\/login/);
    assert.match(stdout, /feature\/signup/);
    assert.doesNotMatch(stdout, /\bmain\b/);
  });
});

describe("bb branch user <filter>", () => {
  test("only includes branches whose latest commit author contains the filter", async () => {
    stubBranches([
      branchFixture({ name: "alice-branch", author: "Alice Smith" }),
      branchFixture({ name: "bob-branch", author: "Bob Jones" }),
      branchFixture({ name: "alice-other", author: "Alice Smith" }),
    ]);

    const { stdout } = await sandbox.runCli(["branch", "user", "Alice"]);

    assert.match(stdout, /alice-branch/);
    assert.match(stdout, /alice-other/);
    assert.doesNotMatch(stdout, /bob-branch/);
  });
});
