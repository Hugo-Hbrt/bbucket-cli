import { Args } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class BrowseBranch extends BaseCommand<typeof BrowseBranch> {
  static override description =
    "Open a branch in the default browser (defaults to the current local branch)";

  static override args = {
    name: Args.string({
      description: "branch name (defaults to the current git branch)",
      required: false,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(BrowseBranch);
    const config = await this.getConfigOrThrow();
    const url = await this.composition.browse.branch(config.workspace, config.repoSlug, args.name);
    this.output.browserOpened(url);
  }
}
