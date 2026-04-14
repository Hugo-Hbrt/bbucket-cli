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

const ENVIRONMENTS_ENDPOINT = "/2.0/repositories/my-ws/my-repo/environments";

function stubEnvironments(values) {
  bitbucket.stub("GET", ENVIRONMENTS_ENDPOINT, { body: { values } });
}

function environmentFixture({
  uuid = "{abc-123}",
  name = "Production",
  typeName = "Production",
} = {}) {
  return {
    uuid,
    name,
    environment_type: {
      name: typeName,
      rank: 2,
      type: "deployment_environment_type",
    },
  };
}

describe("bb env list", () => {
  test("shows name, UUID and environment type for each environment", async () => {
    stubEnvironments([
      environmentFixture({ uuid: "{prod-uuid}", name: "Production", typeName: "Production" }),
      environmentFixture({ uuid: "{stage-uuid}", name: "Staging", typeName: "Staging" }),
    ]);

    const { code, stdout } = await sandbox.runCli(["env", "list"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /Production/);
    assert.match(stdout, /Staging/);
    assert.match(stdout, /\{prod-uuid\}/);
    assert.match(stdout, /\{stage-uuid\}/);
  });
});
