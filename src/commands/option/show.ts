import { BaseCommand } from "../base-command.js";

export default class OptionShow extends BaseCommand<typeof OptionShow> {
  static override description = "Display current CLI preferences";

  static override examples = ["<%= config.bin %> option show"];

  public async run(): Promise<void> {
    const prefs = await this.composition.preferences.get();
    this.output.preferencesShown(prefs);
  }
}
