import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class BranchDelete extends BaseCommand<typeof BranchDelete> {
  static override description = "Delete a branch";

  static override args = {
    name: Args.string({
      description: "branch name to delete",
      required: true,
    }),
  };

  static override flags = {
    yes: Flags.boolean({
      description: "skip the confirmation prompt",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(BranchDelete);
    const config = await this.getConfigOrThrow();
    await this.composition.branches.delete(config.workspace, config.repoSlug, args.name, flags.yes);
    this.output.branchDeleted(args.name);
  }
}
