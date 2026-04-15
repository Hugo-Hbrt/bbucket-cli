import { Args } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class PrApprove extends BaseCommand<typeof PrApprove> {
  static override description = "Approve a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrApprove);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.approve(config.workspace, config.repoSlug, args.id);
    this.output.pullRequestActionApplied("Approved", args.id);
  }
}
