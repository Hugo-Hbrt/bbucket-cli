import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { IGitClient } from "../../ports/IGitClient.js";

const execFileAsync = promisify(execFile);

export class GitCliClient implements IGitClient {
  async fetch(branch: string): Promise<void> {
    await execFileAsync("git", ["fetch", "origin", branch]);
  }

  async checkout(branch: string): Promise<void> {
    await execFileAsync("git", ["checkout", branch]);
  }

  async currentBranch(): Promise<string> {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
    return stdout.trim();
  }
}
