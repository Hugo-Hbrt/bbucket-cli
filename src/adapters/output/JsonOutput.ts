import type { Branch, MaskedBbConfig } from "../../domain/types.js";
import type { IOutputPort } from "../../ports/IOutputPort.js";

export class JsonOutput implements IOutputPort {
  authSaved(config: MaskedBbConfig, _location: string): void {
    this.print(config);
  }

  authShown(config: MaskedBbConfig, _location: string): void {
    this.print(config);
  }

  branchesListed(branches: Branch[]): void {
    this.print(branches);
  }

  private print(data: unknown): void {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  }
}
