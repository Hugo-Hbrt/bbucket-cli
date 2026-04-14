import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PrComments extends BaseCommand<typeof PrComments> {
  static override description = "List all comments on a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  static override flags = {
    unresolved: Flags.boolean({
      description: "show only unresolved comments",
      exclusive: ["resolved"],
    }),
    resolved: Flags.boolean({
      description: "show only resolved comments",
      exclusive: ["unresolved"],
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PrComments);
    const config = await this.getConfigOrThrow();
    const comments = await this.composition.pullRequests.comments(
      config.workspace,
      config.repoSlug,
      args.id,
      { unresolved: flags.unresolved, resolved: flags.resolved },
    );
    this.output.commentsListed(comments);
  }
}
