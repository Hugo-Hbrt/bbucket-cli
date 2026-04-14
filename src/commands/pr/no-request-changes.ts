import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrNoRequestChanges extends BaseCommand<typeof PrNoRequestChanges> {
  static override description = "Remove the 'changes requested' status from a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrNoRequestChanges);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.unrequestChanges(
      config.workspace,
      config.repoSlug,
      args.id,
    );
    this.output.pullRequestActionApplied("Removed changes request from", args.id);
  }
}
