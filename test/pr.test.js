import { strict as assert } from "node:assert";
import { after, before, beforeEach, describe, test } from "node:test";

import { startFakeBitbucket } from "./helpers/bitbucket.js";
import { createSandbox } from "./helpers/cli.js";

let sandbox;
let bitbucket;
let baseConfig;

before(async () => {
  sandbox = await createSandbox();
  bitbucket = await startFakeBitbucket();
  baseConfig = {
    email: "test@example.com",
    api_token: "test-token",
    workspace: "my-ws",
    repo_slug: "my-repo",
    api_base_url: bitbucket.url,
  };
});

after(async () => {
  await bitbucket.stop();
  await sandbox.destroy();
});

beforeEach(async () => {
  bitbucket.reset();
  await sandbox.writeConfig(baseConfig);
});

const PRS_ENDPOINT = "/2.0/repositories/my-ws/my-repo/pullrequests";

function stubPullRequests(values) {
  bitbucket.stub("GET", PRS_ENDPOINT, { body: { values } });
}

function stubPullRequest(id, body, { commitCount = 0 } = {}) {
  bitbucket.stub("GET", `${PRS_ENDPOINT}/${id}`, { body });
  bitbucket.stub("GET", `${PRS_ENDPOINT}/${id}/commits`, {
    body: { size: commitCount, values: [] },
  });
}

function prFixture({
  id = 1,
  title = "Sample PR",
  author = "Alice",
  sourceBranch = "feature",
  destinationBranch = "main",
  state = "OPEN",
  createdOn = "2026-04-14T10:00:00Z",
} = {}) {
  return {
    id,
    title,
    state,
    author: { display_name: author },
    source: { branch: { name: sourceBranch } },
    destination: { branch: { name: destinationBranch } },
    created_on: createdOn,
  };
}

describe("bb pr list", () => {
  test("lists one open PR's id and title", async () => {
    stubPullRequests([prFixture({ id: 42, title: "Add login page" })]);

    const { code, stdout } = await sandbox.runCli(["pr", "list"]);

    assert.equal(code, 0, `expected exit 0, stderr/stdout: ${stdout}`);
    assert.match(stdout, /42/);
    assert.match(stdout, /Add login page/);
  });

  test("shows id, title, author, src→dest, state, and created date for each PR", async () => {
    stubPullRequests([
      prFixture({
        id: 7,
        title: "Refactor auth",
        author: "Jane Doe",
        sourceBranch: "feature/auth",
        destinationBranch: "main",
        state: "OPEN",
        createdOn: "2026-03-20T15:30:00Z",
      }),
    ]);

    const { stdout } = await sandbox.runCli(["pr", "list"]);

    assert.match(stdout, /7/);
    assert.match(stdout, /Refactor auth/);
    assert.match(stdout, /Jane Doe/);
    assert.match(stdout, /feature\/auth/);
    assert.match(stdout, /main/);
    assert.match(stdout, /open/i);
    assert.match(stdout, /2026-03-20/);
  });

  test("positional arg filters by destination branch", async () => {
    stubPullRequests([
      prFixture({ id: 1, title: "Into main", destinationBranch: "main" }),
      prFixture({ id: 2, title: "Into develop", destinationBranch: "develop" }),
      prFixture({ id: 3, title: "Also into main", destinationBranch: "main" }),
    ]);

    const { stdout } = await sandbox.runCli(["pr", "list", "main"]);

    assert.match(stdout, /Into main/);
    assert.match(stdout, /Also into main/);
    assert.doesNotMatch(stdout, /Into develop/);
  });

  test("--state merged passes the MERGED state filter to the API", async () => {
    stubPullRequests([]);

    await sandbox.runCli(["pr", "list", "--state", "merged"]);

    const urls = bitbucket.calls.map((c) => c.url);
    assert.ok(
      urls.some((u) => u.includes("MERGED")),
      `expected a call with MERGED in the URL, got: ${urls.join(", ")}`,
    );
  });
});

describe("bb pr diff <id>", () => {
  test("prints the raw diff from the API pipeable to stdout", async () => {
    const rawDiff =
      "diff --git a/foo.txt b/foo.txt\n--- a/foo.txt\n+++ b/foo.txt\n@@ -1 +1 @@\n-old\n+new\n";
    bitbucket.stub("GET", "/2.0/repositories/my-ws/my-repo/pullrequests/42/diff", {
      body: rawDiff,
    });

    const { code, stdout } = await sandbox.runCli(["pr", "diff", "42"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.equal(stdout, rawDiff);
  });
});

describe("bb pr view <id>", () => {
  test("shows the PR's title and description", async () => {
    stubPullRequest(
      42,
      prDetailFixture({
        id: 42,
        title: "Add login page",
        summary: "Implements the login form and submit handler",
      }),
    );

    const { code, stdout } = await sandbox.runCli(["pr", "view", "42"]);

    assert.equal(code, 0, `expected exit 0, got stdout: ${stdout}`);
    assert.match(stdout, /Add login page/);
    assert.match(stdout, /Implements the login form/);
  });

  test("shows the comment count", async () => {
    stubPullRequest(3, prDetailFixture({ id: 3, title: "Chatty PR", commentCount: 17 }));

    const { stdout } = await sandbox.runCli(["pr", "view", "3"]);

    assert.match(stdout, /17/);
    assert.match(stdout, /comment/i);
  });

  test("shows the commit count from the commits endpoint", async () => {
    stubPullRequest(9, prDetailFixture({ id: 9, title: "Big PR" }), { commitCount: 42 });

    const { stdout } = await sandbox.runCli(["pr", "view", "9"]);

    assert.match(stdout, /42/);
    assert.match(stdout, /commit/i);
  });

  test("shows each reviewer with their approval status", async () => {
    stubPullRequest(
      7,
      prDetailFixture({
        id: 7,
        title: "Test PR",
        participants: [
          { user: "Alice", role: "REVIEWER", approved: true, state: "approved" },
          { user: "Bob", role: "REVIEWER", approved: false, state: "changes_requested" },
          { user: "Carol", role: "REVIEWER", approved: false, state: null },
          { user: "Dave", role: "PARTICIPANT", approved: false, state: null },
        ],
      }),
    );

    const { stdout } = await sandbox.runCli(["pr", "view", "7"]);

    assert.match(stdout, /Alice.*approved/i);
    assert.match(stdout, /Bob.*changes[_ ]requested/i);
    assert.match(stdout, /Carol.*(pending|unreviewed|none)/i);
    assert.doesNotMatch(stdout, /Dave/, "non-reviewer participants should be excluded");
  });
});

function prDetailFixture({
  id = 1,
  title = "Sample PR",
  summary = "",
  author = "Alice",
  sourceBranch = "feature",
  destinationBranch = "main",
  state = "OPEN",
  createdOn = "2026-04-14T10:00:00Z",
  participants = [],
  commentCount = 0,
} = {}) {
  return {
    id,
    title,
    summary: { raw: summary },
    state,
    author: { display_name: author },
    source: { branch: { name: sourceBranch } },
    destination: { branch: { name: destinationBranch } },
    created_on: createdOn,
    comment_count: commentCount,
    participants: participants.map((p) => ({
      user: { display_name: p.user },
      role: p.role,
      approved: p.approved,
      state: p.state,
    })),
  };
}
