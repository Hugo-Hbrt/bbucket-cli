import { BbConfigNotFoundError } from "../domain/errors.js";
import type { OutputStyle, Preferences } from "../domain/types.js";
import type { IConfigReader } from "../ports/IConfigReader.js";
import type { IConfigWriter } from "../ports/IConfigWriter.js";

export class PreferencesService {
  private readonly _reader: IConfigReader;
  private readonly _writer: IConfigWriter;

  constructor(reader: IConfigReader, writer: IConfigWriter) {
    if (!reader) {
      throw new Error("IConfigReader is required");
    }
    if (!writer) {
      throw new Error("IConfigWriter is required");
    }
    this._reader = reader;
    this._writer = writer;
  }

  async get(): Promise<Preferences> {
    const config = await this._reader.read();
    if (!config) {
      throw new BbConfigNotFoundError();
    }
    return { outputStyle: config.outputStyle ?? "normal" };
  }

  async setOutputStyle(style: OutputStyle): Promise<void> {
    const config = await this._reader.read();
    if (!config) {
      throw new BbConfigNotFoundError();
    }
    await this._writer.write({ ...config, outputStyle: style });
  }
}
