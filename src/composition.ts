import { HttpBitbucketClient } from "./adapters/api/HttpBitbucketClient.js";
import { InquirerConfigPrompter } from "./adapters/config/InquirerConfigPrompter.js";
import { JsonConfigReader } from "./adapters/config/JsonConfigReader.js";
import type { IConfigReader } from "./ports/IConfigReader.js";
import { AuthService } from "./services/AuthService.js";
import { BranchService } from "./services/BranchService.js";

export type Composition = {
  configReader: IConfigReader;
  auth: AuthService;
  branches: BranchService;
};

export function compose(): Composition {
  const config = JsonConfigReader.default();
  const prompter = new InquirerConfigPrompter();
  const bitbucket = new HttpBitbucketClient(config);

  return {
    configReader: config,
    auth: new AuthService(config, config, prompter),
    branches: new BranchService(bitbucket),
  };
}
