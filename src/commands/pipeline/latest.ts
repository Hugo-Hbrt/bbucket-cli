import { BaseCommand } from "../../base-command.js";

export default class PipelineLatest extends BaseCommand<typeof PipelineLatest> {
  static override description = "Show details of the most recent pipeline run";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const pipeline = await this.composition.pipelines.latest(config.workspace, config.repoSlug);
    if (!pipeline) {
      this.log("No pipelines found.");
      return;
    }
    this.output.pipelineShown(pipeline);
  }
}
