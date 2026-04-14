import { BaseCommand } from "../base-command.js";

export default class BrowseRepo extends BaseCommand<typeof BrowseRepo> {
  static override description = "Open the repository homepage in the default browser";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const url = await this.composition.browse.repo(config.workspace, config.repoSlug);
    this.output.browserOpened(url);
  }
}
