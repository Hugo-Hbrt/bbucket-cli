import { Command, Flags, type Interfaces } from "@oclif/core";

import { AiOutput } from "../adapters/output/AiOutput.js";
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
    "output-style": Flags.string({
      description: "Output style: normal (default), json, or ai",
      options: ["normal", "json", "ai"],
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

    this.composition = compose();
    const style = await this.resolveOutputStyle();
    this.output = selectOutputAdapter(style);
  }

  private async resolveOutputStyle(): Promise<string> {
    const flag = this.flags["output-style"];
    if (flag) {
      return flag;
    }
    const config = await this.composition.configReader.read();
    return config?.outputStyle ?? "normal";
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

function selectOutputAdapter(style: string): IOutputPort {
  if (style === "json") {
    return new JsonOutput();
  }
  if (style === "ai") {
    return new AiOutput();
  }
  return new TableOutput();
}
