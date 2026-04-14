import { spawn } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const CLI = join(ROOT, "bin", "run.js");

export async function createSandbox() {
  const home = await mkdtemp(join(tmpdir(), "bb-test-"));
  const configPath = join(home, ".bb-cli-config.json");
  const fakeGitDir = join(home, "bin");
  const gitLogPath = join(home, "git-calls.log");
  let fakeGitInstalled = false;

  async function installFakeGit() {
    if (fakeGitInstalled) {
      return;
    }
    await mkdir(fakeGitDir, { recursive: true });
    const script = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(gitLogPath)}, args.join(' ') + '\\n');
if (args[0] === 'rev-parse') {
  process.stdout.write((process.env.BB_FAKE_GIT_BRANCH || 'test-branch') + '\\n');
}
process.exit(0);
`;
    const gitPath = join(fakeGitDir, "git");
    await writeFile(gitPath, script);
    await chmod(gitPath, 0o755);
    fakeGitInstalled = true;
  }

  const browseLogPath = join(home, "browse-calls.log");

  return {
    async writeConfig(config) {
      await writeFile(configPath, JSON.stringify(config, null, 2));
    },
    async clearConfig() {
      await rm(configPath, { force: true });
    },
    async useFakeGit() {
      await installFakeGit();
      await rm(gitLogPath, { force: true });
    },
    async gitCalls() {
      try {
        const content = await readFile(gitLogPath, "utf8");
        return content
          .trim()
          .split("\n")
          .filter((line) => line.length > 0);
      } catch {
        return [];
      }
    },
    async browseCalls() {
      try {
        const content = await readFile(browseLogPath, "utf8");
        return content
          .trim()
          .split("\n")
          .filter((line) => line.length > 0);
      } catch {
        return [];
      }
    },
    runCli(args, options = {}) {
      return new Promise((resolve, reject) => {
        const env = {
          ...process.env,
          HOME: home,
          NO_COLOR: "1",
          BB_INSTANT_POLL: "1",
          BB_BROWSE_LOG: browseLogPath,
        };
        if (fakeGitInstalled) {
          env.PATH = `${fakeGitDir}:${env.PATH ?? ""}`;
        }
        const child = spawn("node", [CLI, ...args], {
          cwd: ROOT,
          env,
        });
        if (options.stdin !== undefined) {
          child.stdin.write(options.stdin);
        }
        child.stdin.end();
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
    },
    async destroy() {
      await rm(home, { recursive: true, force: true });
    },
  };
}
