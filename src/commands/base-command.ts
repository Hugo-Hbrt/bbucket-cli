import { Command, Flags, type Interfaces } from "@oclif/core";

import { JsonOutput } from "../adapters/output/JsonOutput.js";
import { TableOutput } from "../adapters/output/TableOutput.js";
import { type Composition, compose } from "../composition.js";
import { BbConfigNotFoundError, DomainError } from "../domain/errors.js";
import type { BbConfig } from "../domain/types.js";
import type { IOutputPort } from "../ports/IOutputPort.js";

export type BaseFlags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)["baseFlags"] & T["flags"]
>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static override baseFlags = {
    json: Flags.boolean({
      description: "Format output as JSON",
      default: false,
    }),
    "no-color": Flags.boolean({
      description: "Disable colored output",
      default: false,
    }),
  };

  protected flags!: BaseFlags<T>;
  protected output!: IOutputPort;
  protected composition!: Composition;

  public override async init(): Promise<void> {
    await super.init();
    const { flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as BaseFlags<T>;

    if (this.flags["no-color"] === true) {
      process.env.NO_COLOR = "1";
    }

    this.output = this.flags.json === true ? new JsonOutput() : new TableOutput();
    this.composition = compose();
  }

  public override async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    if (err instanceof DomainError) {
      this.error(err.userMessage, { exit: 1 });
    }
    return super.catch(err);
  }

  protected async getConfigOrThrow(): Promise<BbConfig> {
    const config = await this.composition.configReader.read();
    if (!config) {
      throw new BbConfigNotFoundError();
    }
    return config;
  }
}
