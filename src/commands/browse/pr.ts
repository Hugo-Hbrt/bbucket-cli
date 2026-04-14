import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class BrowsePr extends BaseCommand<typeof BrowsePr> {
  static override description = "Open a specific pull request in the default browser";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(BrowsePr);
    const config = await this.getConfigOrThrow();
    const url = await this.composition.browse.pullRequest(
      config.workspace,
      config.repoSlug,
      args.id,
    );
    this.output.browserOpened(url);
  }
}
