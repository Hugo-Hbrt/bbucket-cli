import { Args } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class PrDiff extends BaseCommand<typeof PrDiff> {
  static override description = "Print the raw diff of a pull request to stdout";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrDiff);
    const config = await this.getConfigOrThrow();
    const diff = await this.composition.pullRequests.diff(
      config.workspace,
      config.repoSlug,
      args.id,
    );
    this.output.pullRequestDiffShown(diff);
  }
}
