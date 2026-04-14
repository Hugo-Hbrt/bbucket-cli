import Table from "cli-table3";

import type { Branch, MaskedBbConfig } from "../../domain/types.js";
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

  branchesListed(branches: Branch[]): void {
    const table = new Table({
      head: ["Branch", "Commit", "Author", "Updated"],
    });
    for (const branch of branches) {
      table.push([
        branch.name,
        branch.commitHash.slice(0, 7),
        branch.author,
        branch.updatedAt.toISOString().slice(0, 10),
      ]);
    }
    process.stdout.write(`${table.toString()}\n`);
  }
}
