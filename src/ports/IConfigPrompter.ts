import type { BbConfig } from "../domain/types.js";

export interface IConfigPrompter {
  promptForConfig(defaults: Partial<BbConfig>): Promise<BbConfig>;
}
