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

const PIPELINES_ENDPOINT = "/2.0/repositories/my-ws/my-repo/pipelines";

function stubPipelines(values) {
  bitbucket.stub("GET", PIPELINES_ENDPOINT, { body: { values } });
}

function pipelineFixture({
  buildNumber = 1,
  branch = "main",
  triggerType = "pipeline_trigger_push",
  stateName = "COMPLETED",
  resultName = "SUCCESSFUL",
  createdOn = "2026-04-14T10:00:00Z",
  buildSeconds = 120,
} = {}) {
  return {
    uuid: `{${buildNumber}-uuid}`,
    build_number: buildNumber,
    state: {
      name: stateName,
      ...(stateName === "COMPLETED" ? { result: { name: resultName } } : {}),
    },
    target: { ref_name: branch },
    trigger: { type: triggerType },
    created_on: createdOn,
    build_seconds_used: buildSeconds,
  };
}

describe("bb pipeline list", () => {
  test("lists one pipeline's build number", async () => {
    stubPipelines([pipelineFixture({ buildNumber: 42 })]);

    const { code, stdout } = await sandbox.runCli(["pipeline", "list"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /42/);
  });

  test("bb pipeline wait returns when the pipeline reaches a terminal state", async () => {
    bitbucket.stub("GET", `${PIPELINES_ENDPOINT}/{abc}`, {
      body: pipelineFixture({
        buildNumber: 50,
        stateName: "COMPLETED",
        resultName: "SUCCESSFUL",
      }),
    });

    const { code, stdout } = await sandbox.runCli(["pipeline", "wait", "{abc}"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /50/);
    assert.match(stdout, /completed/i);
  });

  test("bb pipeline wait times out if the pipeline never completes", async () => {
    bitbucket.stub("GET", `${PIPELINES_ENDPOINT}/{stuck}`, {
      body: pipelineFixture({ buildNumber: 7, stateName: "IN_PROGRESS" }),
    });

    const { code, stderr } = await sandbox.runCli([
      "pipeline",
      "wait",
      "{stuck}",
      "--timeout",
      "1",
    ]);

    assert.notEqual(code, 0);
    assert.match(stderr, /did not complete/i);
  });

  test("bb pipeline custom <branch> <name> triggers a named custom pipeline", async () => {
    bitbucket.stub("POST", PIPELINES_ENDPOINT, {
      body: pipelineFixture({ buildNumber: 55, branch: "main" }),
    });

    const { code, stdout } = await sandbox.runCli(["pipeline", "custom", "main", "nightly-build"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /55/);
    const postCall = bitbucket.calls.find((c) => c.method === "POST");
    assert.ok(postCall);
    assert.equal(postCall.body.target.selector.type, "custom");
    assert.equal(postCall.body.target.selector.pattern, "nightly-build");
  });

  test("bb pipeline run <branch> triggers the default pipeline for that branch", async () => {
    bitbucket.stub("POST", PIPELINES_ENDPOINT, {
      body: pipelineFixture({ buildNumber: 123, branch: "main", stateName: "PENDING" }),
    });

    const { code, stdout } = await sandbox.runCli(["pipeline", "run", "main"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /123/);
    const postCall = bitbucket.calls.find((c) => c.method === "POST");
    assert.ok(postCall, "expected a POST to /pipelines");
    assert.equal(postCall.body.target.ref_name, "main");
    assert.equal(postCall.body.target.ref_type, "branch");
  });

  test("bb pipeline latest shows the most recent pipeline via sort=-created_on", async () => {
    stubPipelines([
      pipelineFixture({
        buildNumber: 99,
        branch: "main",
        stateName: "COMPLETED",
        resultName: "FAILED",
        buildSeconds: 73,
      }),
    ]);

    const { code, stdout } = await sandbox.runCli(["pipeline", "latest"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /99/);
    assert.match(stdout, /main/);
    assert.match(stdout, /failed/i);
    assert.ok(
      bitbucket.calls.some((c) => c.url.includes("sort=-created_on")),
      `expected a call sorted by -created_on, got: ${bitbucket.calls.map((c) => c.url).join(", ")}`,
    );
  });

  test("shows branch, trigger, state, result, created date, duration", async () => {
    stubPipelines([
      pipelineFixture({
        buildNumber: 7,
        branch: "feature/login",
        triggerType: "pipeline_trigger_push",
        stateName: "COMPLETED",
        resultName: "SUCCESSFUL",
        createdOn: "2026-03-20T15:30:00Z",
        buildSeconds: 245,
      }),
    ]);

    const { stdout } = await sandbox.runCli(["pipeline", "list"]);

    assert.match(stdout, /feature\/login/);
    assert.match(stdout, /push/i);
    assert.match(stdout, /completed/i);
    assert.match(stdout, /successful/i);
    assert.match(stdout, /2026-03-20/);
    assert.match(stdout, /4m 5s|245s/);
  });
});
