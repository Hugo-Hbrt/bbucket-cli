import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class BranchUser extends BaseCommand<typeof BranchUser> {
  static override description =
    "List branches whose latest commit author contains the given substring";

  static override args = {
    filter: Args.string({
      description: "substring to match against commit author names",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(BranchUser);
    const config = await this.getConfigOrThrow();
    const branches = await this.composition.branches.list(config.workspace, config.repoSlug, {
      authorContains: args.filter,
    });
    this.output.branchesListed(branches);
  }
}
