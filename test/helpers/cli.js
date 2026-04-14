import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const CLI = join(ROOT, "bin", "run.js");

export async function createSandbox() {
  const home = await mkdtemp(join(tmpdir(), "bb-test-"));
  const configPath = join(home, ".bb-cli-config.json");

  return {
    async writeConfig(config) {
      await writeFile(configPath, JSON.stringify(config, null, 2));
    },
    async clearConfig() {
      await rm(configPath, { force: true });
    },
    runCli(args) {
      return new Promise((resolve, reject) => {
        const child = spawn("node", [CLI, ...args], {
          cwd: ROOT,
          env: { ...process.env, HOME: home, NO_COLOR: "1" },
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
    },
    async destroy() {
      await rm(home, { recursive: true, force: true });
    },
  };
}
