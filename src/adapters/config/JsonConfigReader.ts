import { chmod, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

import { InvalidConfigError } from "../../domain/errors.js";
import { type BbConfig, isValidOutputStyle, OUTPUT_STYLES } from "../../domain/types.js";
import type { IConfigReader } from "../../ports/IConfigReader.js";
import type { IConfigWriter } from "../../ports/IConfigWriter.js";

type StoredConfig = {
  email?: string;
  api_token?: string;
  workspace?: string;
  repo_slug?: string;
  api_base_url?: string;
  output_style?: string;
};

export class JsonConfigReader implements IConfigReader, IConfigWriter {
  private readonly _path: string;

  constructor(path: string) {
    this._path = path;
  }

  static default(): JsonConfigReader {
    return new JsonConfigReader(join(homedir(), ".bb-cli-config.json"));
  }

  location(): string {
    return this._path;
  }

  async read(): Promise<BbConfig | null> {
    let raw: string;
    try {
      raw = await readFile(this._path, "utf8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
        return null;
      }
      throw err;
    }
    const parsed = JSON.parse(raw) as StoredConfig;
    if (parsed.output_style !== undefined && !isValidOutputStyle(parsed.output_style)) {
      throw new InvalidConfigError(
        `output_style must be one of ${OUTPUT_STYLES.join(", ")} (got "${parsed.output_style}")`,
      );
    }
    return {
      email: parsed.email ?? "",
      apiToken: parsed.api_token ?? "",
      workspace: parsed.workspace ?? "",
      repoSlug: parsed.repo_slug ?? "",
      apiBaseUrl: parsed.api_base_url,
      outputStyle: parsed.output_style,
    };
  }

  async write(config: BbConfig): Promise<void> {
    const stored: StoredConfig = {
      email: config.email,
      api_token: config.apiToken,
      workspace: config.workspace,
      repo_slug: config.repoSlug,
      api_base_url: config.apiBaseUrl,
      output_style: config.outputStyle,
    };
    await writeFile(this._path, `${JSON.stringify(stored, null, 2)}\n`, "utf8");
    await chmod(this._path, 0o600);
  }
}
