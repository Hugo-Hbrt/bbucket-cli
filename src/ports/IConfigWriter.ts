import type { BbConfig } from "../domain/types.js";

export interface IConfigWriter {
  write(config: BbConfig): Promise<void>;
}
