import type { MaskedBbConfig } from "../../domain/types.js";
import type { IOutputPort } from "../../ports/IOutputPort.js";

export class TableOutput implements IOutputPort {
  authSaved(_config: MaskedBbConfig, location: string): void {
    process.stdout.write(`Saved credentials to ${location}\n`);
  }

  authShown(config: MaskedBbConfig, location: string): void {
    process.stdout.write(`Config file: ${location}\n`);
    process.stdout.write(`Email:       ${config.email}\n`);
    process.stdout.write(`Token:       ${config.apiToken}\n`);
    process.stdout.write(`Workspace:   ${config.workspace}\n`);
    process.stdout.write(`Repo slug:   ${config.repoSlug}\n`);
  }
}
