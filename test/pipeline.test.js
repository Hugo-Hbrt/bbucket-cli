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
