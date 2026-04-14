import { BaseCommand } from "../base-command.js";

export default class AuthSave extends BaseCommand<typeof AuthSave> {
  static override description =
    "Interactively save Bitbucket credentials and default workspace/repo";

  static override examples = ["<%= config.bin %> auth save", "<%= config.bin %> auth"];

  public async run(): Promise<void> {
    const masked = await this.composition.auth.save();
    this.output.authSaved(masked, this.composition.configReader.location());
  }
}
