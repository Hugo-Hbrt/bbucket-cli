import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class EnvCreateVariable extends BaseCommand<typeof EnvCreateVariable> {
  static override description = "Create a variable in a deployment environment";

  static override args = {
    "env-uuid": Args.string({
      description: "the environment UUID",
      required: true,
    }),
    key: Args.string({
      description: "variable key",
      required: true,
    }),
    value: Args.string({
      description: "variable value",
      required: true,
    }),
  };

  static override flags = {
    secured: Flags.boolean({
      description: "mark the variable as secured",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(EnvCreateVariable);
    const config = await this.getConfigOrThrow();
    const variable = await this.composition.environments.createVariable(
      config.workspace,
      config.repoSlug,
      args["env-uuid"],
      args.key,
      args.value,
      flags.secured,
    );
    this.output.environmentVariableSaved(variable);
  }
}
