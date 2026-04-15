import { Args } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class PrView extends BaseCommand<typeof PrView> {
  static override description = "Show details of a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrView);
    const config = await this.getConfigOrThrow();
    const pr = await this.composition.pullRequests.view(config.workspace, config.repoSlug, args.id);
    this.output.pullRequestShown(pr);
  }
}
