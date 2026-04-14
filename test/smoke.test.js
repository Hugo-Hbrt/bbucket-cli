import { strict as assert } from "node:assert";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CLI = join(ROOT, "bin", "run.js");

let HOME;

before(async () => {
  HOME = await mkdtemp(join(tmpdir(), "bb-smoke-"));
});

after(async () => {
  await rm(HOME, { recursive: true, force: true });
});

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [CLI, ...args], {
      cwd: ROOT,
      env: { ...process.env, HOME, NO_COLOR: "1" },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

const FAKE_CONFIG = {
  email: "test@example.com",
  api_token: "super-secret-token-do-not-leak",
  workspace: "my-workspace",
  repo_slug: "my-repo",
};

async function writeFakeConfig() {
  await writeFile(join(HOME, ".bb-cli-config.json"), JSON.stringify(FAKE_CONFIG, null, 2));
}

async function clearConfig() {
  await rm(join(HOME, ".bb-cli-config.json"), { force: true });
}

describe("bb CLI smoke tests", () => {
  test("bb --version prints version", async () => {
    const { code, stdout } = await runCli(["--version"]);
    assert.equal(code, 0);
    assert.match(stdout, /bb-cli\/\d+\.\d+\.\d+/);
  });

  test("bb --help lists the auth topic", async () => {
    const { code, stdout } = await runCli(["--help"]);
    assert.equal(code, 0);
    assert.match(stdout, /auth/);
  });

  test("bb auth show with no config exits 1 with friendly error", async () => {
    await clearConfig();
    const { code, stderr } = await runCli(["auth", "show"]);
    assert.equal(code, 1);
    assert.match(stderr, /No credentials saved/);
    assert.match(stderr, /bb auth/);
  });

  test("bb auth show prints human output with masked token", async () => {
    await writeFakeConfig();
    const { code, stdout } = await runCli(["auth", "show"]);
    assert.equal(code, 0);
    assert.match(stdout, /Email:\s+test@example\.com/);
    assert.match(stdout, /Token:\s+\*\*\*\*/);
    assert.match(stdout, /Workspace:\s+my-workspace/);
    assert.match(stdout, /Repo slug:\s+my-repo/);
    assert.doesNotMatch(stdout, /super-secret-token-do-not-leak/);
  });

  test("bb auth show --json prints masked JSON with camelCase keys", async () => {
    await writeFakeConfig();
    const { code, stdout } = await runCli(["auth", "show", "--json"]);
    assert.equal(code, 0);
    const parsed = JSON.parse(stdout);
    assert.deepEqual(parsed, {
      email: "test@example.com",
      apiToken: "****",
      workspace: "my-workspace",
      repoSlug: "my-repo",
    });
  });
});

describe("clean architecture acid test", () => {
  async function findTsFiles(dir) {
    const out = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await findTsFiles(full)));
      } else if (entry.name.endsWith(".ts")) {
        out.push(full);
      }
    }
    return out;
  }

  function extractImports(source) {
    const regex = /^import\s+(?:type\s+)?(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/gm;
    return Array.from(source.matchAll(regex), (m) => m[1]);
  }

  function isAllowed(layer, importPath) {
    if (importPath.startsWith("./")) {
      return true;
    }
    if (layer === "domain") {
      return false;
    }
    if (layer === "ports") {
      return importPath.startsWith("../domain/");
    }
    if (layer === "services") {
      return importPath.startsWith("../domain/") || importPath.startsWith("../ports/");
    }
    return false;
  }

  for (const layer of ["domain", "ports", "services"]) {
    test(`${layer}/ has no forbidden imports`, async () => {
      const files = await findTsFiles(join(ROOT, "src", layer));
      assert.ok(files.length > 0, `expected src/${layer} to contain .ts files`);

      const violations = [];
      for (const file of files) {
        const source = await readFile(file, "utf8");
        for (const importPath of extractImports(source)) {
          if (isAllowed(layer, importPath) === false) {
            violations.push(`${file.replace(`${ROOT}/`, "")} imports ${importPath}`);
          }
        }
      }
      assert.deepEqual(
        violations,
        [],
        `${layer}/ must only import inward (allowed: relative within layer, ../domain, ../ports). Violations:\n  ${violations.join("\n  ")}`,
      );
    });
  }
});
