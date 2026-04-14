import type { BbConfig } from "../domain/types.js";

export interface IConfigReader {
  read(): Promise<BbConfig | null>;
  location(): string;
}
