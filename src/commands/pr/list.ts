import { Args, Flags } from "@oclif/core";

import type { PullRequestState } from "../../domain/types.js";
import { BaseCommand } from "../base-command.js";

export default class PrList extends BaseCommand<typeof PrList> {
  static override description =
    "List pull requests in the repository, optionally filtered by destination branch";

  static override args = {
    branch: Args.string({
      description: "only list PRs targeting this destination branch",
      required: false,
    }),
  };

  static override flags = {
    state: Flags.string({
      description: "filter by PR state (default: open)",
      options: ["open", "merged", "declined", "superseded"],
      default: "open",
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PrList);
    const config = await this.getConfigOrThrow();
    const prs = await this.composition.pullRequests.list(config.workspace, config.repoSlug, {
      destinationBranch: args.branch,
      state: flags.state as PullRequestState,
    });
    this.output.pullRequestsListed(prs);
  }
}
