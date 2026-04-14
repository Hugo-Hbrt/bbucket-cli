import { InquirerConfigPrompter } from "./adapters/config/InquirerConfigPrompter.js";
import { JsonConfigReader } from "./adapters/config/JsonConfigReader.js";
import type { IConfigReader } from "./ports/IConfigReader.js";
import { AuthService } from "./services/AuthService.js";

export type Composition = {
  configReader: IConfigReader;
  auth: AuthService;
};

export function compose(): Composition {
  const config = JsonConfigReader.default();
  const prompter = new InquirerConfigPrompter();

  return {
    configReader: config,
    auth: new AuthService(config, config, prompter),
  };
}
