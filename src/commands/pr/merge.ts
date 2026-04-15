import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class PrMerge extends BaseCommand<typeof PrMerge> {
  static override description = "Merge a pull request";

  static override args = {
    id: Args.integer({
      description: "the pull request ID",
      required: true,
    }),
  };

  static override flags = {
    strategy: Flags.string({
      description: "merge strategy",
      options: ["merge", "squash", "fast-forward"],
      default: "merge",
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PrMerge);
    const config = await this.getConfigOrThrow();
    await this.composition.pullRequests.merge(
      config.workspace,
      config.repoSlug,
      args.id,
      flags.strategy as "merge" | "squash" | "fast-forward",
    );
    this.output.pullRequestActionApplied("Merged", args.id);
  }
}
