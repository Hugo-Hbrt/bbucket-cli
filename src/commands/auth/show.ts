import { BaseCommand } from "../base-command.js";

export default class AuthShow extends BaseCommand<typeof AuthShow> {
  static override description = "Show saved Bitbucket credentials (API token masked)";

  static override examples = ["<%= config.bin %> auth show"];

  public async run(): Promise<void> {
    const masked = await this.composition.auth.show();
    this.output.authShown(masked, this.composition.configReader.location());
  }
}
