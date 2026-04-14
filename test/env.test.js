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

const VARIABLES_ENDPOINT = (envUuid) =>
  `/2.0/repositories/my-ws/my-repo/deployments_config/environments/${envUuid}/variables`;

function stubVariables(envUuid, values) {
  bitbucket.stub("GET", VARIABLES_ENDPOINT(envUuid), { body: { values } });
}

function variableFixture({
  uuid = "{var-uuid}",
  key = "API_URL",
  value = "https://api.example.com",
  secured = false,
} = {}) {
  return { uuid, key, value, secured };
}

describe("bb env create-variable", () => {
  test("POSTs a new variable when the key does not exist", async () => {
    stubVariables("{prod-uuid}", []);
    bitbucket.stub("POST", VARIABLES_ENDPOINT("{prod-uuid}"), {
      body: { uuid: "{var-1}", key: "API_URL", value: "https://x", secured: false },
    });

    const { code, stdout } = await sandbox.runCli([
      "env",
      "create-variable",
      "{prod-uuid}",
      "API_URL",
      "https://x",
    ]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /API_URL/);
    const postCall = bitbucket.calls.find((c) => c.method === "POST");
    assert.ok(postCall);
    assert.equal(postCall.body.key, "API_URL");
    assert.equal(postCall.body.value, "https://x");
  });

  test("prompts to override an existing variable and PUTs on confirm", async () => {
    stubVariables("{prod-uuid}", [
      {
        uuid: "{existing-uuid}",
        key: "API_URL",
        value: "https://old",
        secured: false,
      },
    ]);
    bitbucket.stub("PUT", `${VARIABLES_ENDPOINT("{prod-uuid}")}/{existing-uuid}`, {
      body: { uuid: "{existing-uuid}", key: "API_URL", value: "https://new", secured: false },
    });

    const { code, stdout } = await sandbox.runCli(
      ["env", "create-variable", "{prod-uuid}", "API_URL", "https://new"],
      { stdin: "y\n" },
    );

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    const putCall = bitbucket.calls.find((c) => c.method === "PUT");
    assert.ok(putCall, "expected a PUT to the existing variable");
    assert.equal(putCall.body.value, "https://new");
  });
});

describe("bb env variables <env-uuid>", () => {
  test("lists key, value, and secured status for each variable", async () => {
    stubVariables("{prod-uuid}", [
      variableFixture({ key: "API_URL", value: "https://api.example.com", secured: false }),
      variableFixture({ key: "API_TOKEN", value: "", secured: true }),
    ]);

    const { code, stdout } = await sandbox.runCli(["env", "variables", "{prod-uuid}"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /API_URL/);
    assert.match(stdout, /https:\/\/api\.example\.com/);
    assert.match(stdout, /API_TOKEN/);
    assert.match(stdout, /\*\*\*\*/, "secured value should be masked");
  });

  test("--env-name resolves the UUID via the environments list", async () => {
    stubEnvironments([
      environmentFixture({ uuid: "{prod-uuid}", name: "Production" }),
      environmentFixture({ uuid: "{stage-uuid}", name: "Staging" }),
    ]);
    stubVariables("{stage-uuid}", [variableFixture({ key: "DEBUG", value: "true" })]);

    const { code, stdout } = await sandbox.runCli(["env", "variables", "--env-name", "Staging"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /DEBUG/);
    assert.match(stdout, /true/);
  });
});
