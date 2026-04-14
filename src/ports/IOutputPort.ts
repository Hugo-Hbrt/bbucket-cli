import type { Branch, MaskedBbConfig } from "../domain/types.js";

export interface IOutputPort {
  authSaved(config: MaskedBbConfig, location: string): void;
  authShown(config: MaskedBbConfig, location: string): void;
  branchesListed(branches: Branch[]): void;
}
