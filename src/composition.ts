import { HttpBitbucketClient } from "./adapters/api/HttpBitbucketClient.js";
import { InquirerConfigPrompter } from "./adapters/config/InquirerConfigPrompter.js";
import { JsonConfigReader } from "./adapters/config/JsonConfigReader.js";
import type { IConfigReader } from "./ports/IConfigReader.js";
import type { IConfigWriter } from "./ports/IConfigWriter.js";
import { AuthService } from "./services/AuthService.js";
import { BranchService } from "./services/BranchService.js";
import { PreferencesService } from "./services/PreferencesService.js";

export type Composition = {
  configReader: IConfigReader;
  configWriter: IConfigWriter;
  auth: AuthService;
  branches: BranchService;
  preferences: PreferencesService;
};

export function compose(): Composition {
  const config = JsonConfigReader.default();
  const prompter = new InquirerConfigPrompter();
  const bitbucket = new HttpBitbucketClient(config);

  return {
    configReader: config,
    configWriter: config,
    auth: new AuthService(config, config, prompter),
    branches: new BranchService(bitbucket),
    preferences: new PreferencesService(config, config),
  };
}
