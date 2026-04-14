import { BbConfigNotFoundError } from "../domain/errors.js";
import { maskConfig } from "../domain/masking.js";
import type { BbConfig, MaskedBbConfig } from "../domain/types.js";
import type { IConfigPrompter } from "../ports/IConfigPrompter.js";
import type { IConfigReader } from "../ports/IConfigReader.js";
import type { IConfigWriter } from "../ports/IConfigWriter.js";

export class AuthService {
  private readonly _reader: IConfigReader;
  private readonly _writer: IConfigWriter;
  private readonly _prompter: IConfigPrompter;

  constructor(reader: IConfigReader, writer: IConfigWriter, prompter: IConfigPrompter) {
    if (!reader) {
      throw new Error("IConfigReader is required");
    }
    if (!writer) {
      throw new Error("IConfigWriter is required");
    }
    if (!prompter) {
      throw new Error("IConfigPrompter is required");
    }
    this._reader = reader;
    this._writer = writer;
    this._prompter = prompter;
  }

  async save(): Promise<MaskedBbConfig> {
    const existing = await this._reader.read();
    const defaults: Partial<BbConfig> = existing ?? {};
    const updated = await this._prompter.promptForConfig(defaults);
    await this._writer.write(updated);
    return maskConfig(updated);
  }

  async show(): Promise<MaskedBbConfig> {
    const existing = await this._reader.read();
    if (existing === null) {
      throw new BbConfigNotFoundError();
    }
    return maskConfig(existing);
  }
}
