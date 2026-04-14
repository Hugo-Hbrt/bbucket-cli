import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PipelineWait extends BaseCommand<typeof PipelineWait> {
  static override description =
    "Wait for a pipeline to finish, polling every 5 seconds until completion or timeout";

  static override args = {
    uuid: Args.string({
      description: "the pipeline UUID",
      required: true,
    }),
  };

  static override flags = {
    timeout: Flags.integer({
      description: "timeout in seconds before giving up",
      default: 3600,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(PipelineWait);
    const config = await this.getConfigOrThrow();
    const pipeline = await this.composition.pipelines.wait(
      config.workspace,
      config.repoSlug,
      args.uuid,
      flags.timeout,
    );
    this.output.pipelineShown(pipeline);
  }
}
