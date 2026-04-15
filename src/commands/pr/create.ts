import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class PrCreate extends BaseCommand<typeof PrCreate> {
  static override description = "Create a pull request from one branch to another";

  static override args = {
    source: Args.string({
      description: "the source branch",
      required: true,
    }),
    destination: Args.string({
      description: "the destination branch",
      required: true,
    }),
  };

  static override flags = {
    title: Flags.string({
      description: "PR title",
    }),
    description: Flags.string({
      description: "PR description",
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PrCreate);
    const config = await this.getConfigOrThrow();
    const pr = await this.composition.pullRequests.create(config.workspace, config.repoSlug, {
      title: flags.title,
      description: flags.description,
      sourceBranch: args.source,
      destinationBranch: args.destination,
    });
    this.output.pullRequestCreated(pr);
  }
}
