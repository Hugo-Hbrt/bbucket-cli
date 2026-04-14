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

describe("bb completion <shell>", () => {
  test("bash outputs a bash completion script", async () => {
    const { code, stdout } = await sandbox.runCli(["completion", "bash"]);
    assert.equal(code, 0);
    assert.match(stdout, /complete -F/);
    assert.match(stdout, /auth/);
    assert.match(stdout, /pipeline/);
  });

  test("zsh outputs a zsh completion script", async () => {
    const { code, stdout } = await sandbox.runCli(["completion", "zsh"]);
    assert.equal(code, 0);
    assert.match(stdout, /#compdef bb/);
    assert.match(stdout, /_describe/);
  });

  test("fish outputs a fish completion snippet", async () => {
    const { code, stdout } = await sandbox.runCli(["completion", "fish"]);
    assert.equal(code, 0);
    assert.match(stdout, /complete -c bb/);
  });

  test("rejects unknown shells", async () => {
    const { code } = await sandbox.runCli(["completion", "powershell"]);
    assert.notEqual(code, 0);
  });
});
