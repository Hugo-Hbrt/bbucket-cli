import { strict as assert } from "node:assert";
import { after, before, describe, test } from "node:test";

import { createSandbox } from "./helpers/cli.js";

let sandbox;

before(async () => {
  sandbox = await createSandbox();
});

after(async () => {
  await sandbox.destroy();
});

const BASE_CONFIG = {
  email: "test@example.com",
  api_token: "test-token",
  workspace: "my-ws",
  repo_slug: "my-repo",
};

describe("bb option show", () => {
  test("displays the saved output style from config", async () => {
    await sandbox.writeConfig({ ...BASE_CONFIG, output_style: "json" });

    const { code, stdout } = await sandbox.runCli(["option", "show"]);

    assert.equal(code, 0, `expected exit 0, stdout: ${stdout}`);
    assert.match(stdout, /output[-_ ]?style/i);
    assert.match(stdout, /json/);
  });
});

describe("bb option --output-style", () => {
  test("persists the style so a subsequent 'option show' reflects it", async () => {
    await sandbox.writeConfig(BASE_CONFIG);

    const setResult = await sandbox.runCli(["option", "--output-style", "json"]);
    const showResult = await sandbox.runCli(["option", "show"]);

    assert.equal(setResult.code, 0, `set failed: ${setResult.stderr}`);
    assert.match(showResult.stdout, /json/);
  });
});

describe("config file validation", () => {
  test("rejects an invalid output_style value with a clear error", async () => {
    await sandbox.writeConfig({ ...BASE_CONFIG, output_style: "banana" });

    const { code, stderr } = await sandbox.runCli(["option", "show"]);

    assert.equal(code, 1);
    assert.match(stderr, /output_style|output-style/i);
    assert.match(stderr, /banana/);
  });
});
