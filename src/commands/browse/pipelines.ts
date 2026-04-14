import { BaseCommand } from "../base-command.js";

export default class BrowsePipelines extends BaseCommand<typeof BrowsePipelines> {
  static override description = "Open the pipelines page in the default browser";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const url = await this.composition.browse.pipelines(config.workspace, config.repoSlug);
    this.output.browserOpened(url);
  }
}
