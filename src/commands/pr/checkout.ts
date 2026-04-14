import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrCheckout extends BaseCommand<typeof PrCheckout> {
  static override description = "Fetch and check out the source branch of a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrCheckout);
    const config = await this.getConfigOrThrow();
    const branch = await this.composition.pullRequests.checkout(
      config.workspace,
      config.repoSlug,
      args.id,
    );
    this.output.pullRequestCheckedOut(branch);
  }
}
