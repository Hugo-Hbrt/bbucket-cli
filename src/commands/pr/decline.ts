import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrDecline extends BaseCommand<typeof PrDecline> {
  static override description = "Decline a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrDecline);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.decline(config.workspace, config.repoSlug, args.id);
    this.output.pullRequestActionApplied("Declined", args.id);
  }
}
