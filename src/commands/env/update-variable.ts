import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class EnvUpdateVariable extends BaseCommand<typeof EnvUpdateVariable> {
  static override description = "Update an existing variable in a deployment environment";

  static override args = {
    "env-uuid": Args.string({
      description: "the environment UUID",
      required: true,
    }),
    "var-uuid": Args.string({
      description: "the variable UUID to update",
      required: true,
    }),
    key: Args.string({
      description: "variable key (can be renamed)",
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
    const { args, flags } = await this.parse(EnvUpdateVariable);
    const config = await this.getConfigOrThrow();
    const variable = await this.composition.environments.updateVariable(
      config.workspace,
      config.repoSlug,
      args["env-uuid"],
      args["var-uuid"],
      args.key,
      args.value,
      flags.secured,
    );
    this.output.environmentVariableSaved(variable);
  }
}
