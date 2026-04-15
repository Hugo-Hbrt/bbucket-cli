import { BaseCommand } from "../../base-command.js";

export default class EnvList extends BaseCommand<typeof EnvList> {
  static override description = "List all deployment environments";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const environments = await this.composition.environments.list(
      config.workspace,
      config.repoSlug,
    );
    this.output.environmentsListed(environments);
  }
}
