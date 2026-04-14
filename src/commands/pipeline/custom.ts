import { Args } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class PipelineCustom extends BaseCommand<typeof PipelineCustom> {
  static override description = "Trigger a custom pipeline by name for a branch";

  static override args = {
    branch: Args.string({
      description: "the branch to run the pipeline on",
      required: true,
    }),
    name: Args.string({
      description: "the custom pipeline name",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(PipelineCustom);
    const config = await this.getConfigOrThrow();
    const pipeline = await this.composition.pipelines.runCustom(
      config.workspace,
      config.repoSlug,
      args.branch,
      args.name,
    );
    this.output.pipelineTriggered(pipeline);
  }
}
