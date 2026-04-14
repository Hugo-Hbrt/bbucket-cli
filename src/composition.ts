import { HttpBitbucketClient } from "./adapters/api/HttpBitbucketClient.js";
import { InquirerConfigPrompter } from "./adapters/config/InquirerConfigPrompter.js";
import { JsonConfigReader } from "./adapters/config/JsonConfigReader.js";
import { GitCliClient } from "./adapters/git/GitCliClient.js";
import { InquirerConfirmationPrompter } from "./adapters/prompt/InquirerConfirmationPrompter.js";
import { InquirerPullRequestPrompter } from "./adapters/prompt/InquirerPullRequestPrompter.js";
import type { IConfigReader } from "./ports/IConfigReader.js";
import type { IConfigWriter } from "./ports/IConfigWriter.js";
import { AuthService } from "./services/AuthService.js";
import { BranchService } from "./services/BranchService.js";
import { EnvService } from "./services/EnvService.js";
import { PipelineService } from "./services/PipelineService.js";
import { PreferencesService } from "./services/PreferencesService.js";
import { PullRequestService } from "./services/PullRequestService.js";

export type Composition = {
  configReader: IConfigReader;
  configWriter: IConfigWriter;
  auth: AuthService;
  branches: BranchService;
  pullRequests: PullRequestService;
  pipelines: PipelineService;
  environments: EnvService;
  preferences: PreferencesService;
};

export function compose(): Composition {
  const config = JsonConfigReader.default();
  const prompter = new InquirerConfigPrompter();
  const bitbucket = new HttpBitbucketClient(config);
  const git = new GitCliClient();

  return {
    configReader: config,
    configWriter: config,
    auth: new AuthService(config, config, prompter),
    branches: new BranchService(bitbucket),
    pullRequests: new PullRequestService(bitbucket, new InquirerPullRequestPrompter(), git),
    pipelines: new PipelineService(bitbucket, makeSleep()),
    environments: new EnvService(bitbucket, new InquirerConfirmationPrompter()),
    preferences: new PreferencesService(config, config),
  };
}

function makeSleep(): (ms: number) => Promise<void> {
  if (process.env.BB_INSTANT_POLL) {
    return async () => undefined;
  }
  return (ms) => new Promise((resolve) => setTimeout(resolve, ms));
}
