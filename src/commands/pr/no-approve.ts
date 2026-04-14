import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrNoApprove extends BaseCommand<typeof PrNoApprove> {
  static override description = "Remove your approval from a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrNoApprove);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.unapprove(config.workspace, config.repoSlug, args.id);
    this.output.pullRequestActionApplied("Removed approval from", args.id);
  }
}
