import { BaseCommand } from "../base-command.js";

export default class BranchList extends BaseCommand<typeof BranchList> {
  static override description = "List all branches in the repository";

  public async run(): Promise<void> {
    const config = await this.getConfigOrThrow();
    const branches = await this.composition.branches.list(config.workspace, config.repoSlug);
    this.output.branchesListed(branches);
  }
}
