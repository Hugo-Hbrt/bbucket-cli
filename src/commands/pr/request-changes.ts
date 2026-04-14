import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrRequestChanges extends BaseCommand<typeof PrRequestChanges> {
  static override description = "Mark a pull request as 'changes requested'";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrRequestChanges);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.requestChanges(config.workspace, config.repoSlug, args.id);
    this.output.pullRequestActionApplied("Requested changes on", args.id);
  }
}
