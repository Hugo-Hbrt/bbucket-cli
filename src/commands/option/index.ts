import type { OutputStyle } from "../../domain/types.js";
import { BaseCommand } from "../base-command.js";

export default class Option extends BaseCommand<typeof Option> {
  static override description = "Manage CLI preferences. Pass --output-style to set a default.";

  static override examples = [
    "<%= config.bin %> option --output-style json",
    "<%= config.bin %> option show",
  ];

  public async run(): Promise<void> {
    const style = this.flags["output-style"];
    if (!style) {
      this.error("Usage: bb option --output-style <normal|json|ai>  (or: bb option show)");
    }
    await this.composition.preferences.setOutputStyle(style as OutputStyle);
  }
}
