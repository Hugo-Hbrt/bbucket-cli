import { appendFile } from "node:fs/promises";

import type { IBrowserOpener } from "../../ports/IBrowserOpener.js";

export class LogBrowserOpener implements IBrowserOpener {
  private readonly _path: string;

  constructor(path: string) {
    if (!path) {
      throw new Error("path is required");
    }
    this._path = path;
  }

  async open(url: string): Promise<void> {
    await appendFile(this._path, `${url}\n`);
  }
}
