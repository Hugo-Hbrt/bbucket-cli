import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrCommits extends BaseCommand<typeof PrCommits> {
  static override description = "List all commits in a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PrCommits);
    const config = await this.getConfigOrThrow();
    const commits = await this.composition.pullRequests.commits(
      config.workspace,
      config.repoSlug,
      args.id,
    );
    this.output.commitsListed(commits);
  }
}
