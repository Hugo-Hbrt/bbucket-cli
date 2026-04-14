import { Args, Flags } from "@oclif/core";

import { BaseCommand } from "../base-command.js";

export default class EnvVariables extends BaseCommand<typeof EnvVariables> {
  static override description = "List variables for a deployment environment";

  static override args = {
    "env-uuid": Args.string({
      description: "the environment UUID (omit when --env-name is used)",
      required: false,
    }),
  };

  static override flags = {
    "env-name": Flags.string({
      description: "look up the environment by name instead of UUID",
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(EnvVariables);
    const config = await this.getConfigOrThrow();

    const envName = flags["env-name"];
    const envUuid = args["env-uuid"];

    if (!envName && !envUuid) {
      this.error("Either <env-uuid> or --env-name <name> is required");
    }

    const variables = envName
      ? await this.composition.environments.variablesByName(
          config.workspace,
          config.repoSlug,
          envName,
        )
      : await this.composition.environments.variables(
          config.workspace,
          config.repoSlug,
          envUuid as string,
        );

    this.output.environmentVariablesListed(variables);
  }
}
