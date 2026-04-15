import { Args } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class BranchName extends BaseCommand<typeof BranchName> {
  static override description = "List branches whose name contains the given substring";

  static override args = {
    filter: Args.string({
      description: "substring to match against branch names",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(BranchName);
    const config = await this.getConfigOrThrow();
    const branches = await this.composition.branches.list(config.workspace, config.repoSlug, {
      nameContains: args.filter,
    });
    this.output.branchesListed(branches);
  }
}
