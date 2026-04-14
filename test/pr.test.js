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
