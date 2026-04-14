import { BaseCommand } from "../base-command.js";

export default class PipelineList extends BaseCommand<typeof PipelineList> {
  static override description = "List recent pipeline runs";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const pipelines = await this.composition.pipelines.list(config.workspace, config.repoSlug);
    this.output.pipelinesListed(pipelines);
  }
}
