import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { IBrowserOpener } from "../../ports/IBrowserOpener.js";

const execFileAsync = promisify(execFile);

export class SystemBrowserOpener implements IBrowserOpener {
  async open(url: string): Promise<void> {
    const command =
      process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    await execFileAsync(command, [url]);
  }
}
