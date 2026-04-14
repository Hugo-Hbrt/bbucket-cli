import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PipelineRun extends BaseCommand<typeof PipelineRun> {
  static override description = "Trigger the default pipeline for a branch";

  static override args = {
    branch: Args.string({
      description: "the branch to run the pipeline on",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PipelineRun);
    const config = await this.getConfigOrThrow();
    const pipeline = await this.composition.pipelines.run(
      config.workspace,
      config.repoSlug,
      args.branch,
    );
    this.output.pipelineTriggered(pipeline);
  }
}
