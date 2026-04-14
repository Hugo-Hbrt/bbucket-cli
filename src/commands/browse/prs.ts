import { BaseCommand } from "../base-command.js";

export default class BrowsePrs extends BaseCommand<typeof BrowsePrs> {
  static override description = "Open the pull requests page in the default browser";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const url = await this.composition.browse.pullRequests(config.workspace, config.repoSlug);
    this.output.browserOpened(url);
  }
}
