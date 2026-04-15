import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../../base-command.js";

export default class EnvDeleteVariable extends BaseCommand<typeof EnvDeleteVariable> {
  static override description = "Delete a variable from a deployment environment";

  static override args = {
    "env-uuid": Args.string({
      description: "the environment UUID",
      required: true,
    }),
    "var-uuid": Args.string({
      description: "the variable UUID to delete",
      required: true,
    }),
  };

  static override flags = {
    yes: Flags.boolean({
      description: "skip the confirmation prompt",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(EnvDeleteVariable);
    const config = await this.getConfigOrThrow();
    await this.composition.environments.deleteVariable(
      config.workspace,
      config.repoSlug,
      args["env-uuid"],
      args["var-uuid"],
      flags.yes,
    );
    this.output.environmentVariableDeleted(args["var-uuid"]);
  }
}
