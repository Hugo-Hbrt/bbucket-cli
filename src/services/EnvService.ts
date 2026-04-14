import { EnvironmentNotFoundError } from "../domain/errors.js";
import type { Environment, EnvironmentVariable } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

export class EnvService {
  private readonly _bitbucket: IBitbucketClient;

  constructor(bitbucket: IBitbucketClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    this._bitbucket = bitbucket;
  }

  async list(workspace: string, repoSlug: string): Promise<Environment[]> {
    return this._bitbucket.listEnvironments(workspace, repoSlug);
  }

  async variables(
    workspace: string,
    repoSlug: string,
    envUuid: string,
  ): Promise<EnvironmentVariable[]> {
    return this._bitbucket.listEnvironmentVariables(workspace, repoSlug, envUuid);
  }

  async variablesByName(
    workspace: string,
    repoSlug: string,
    envName: string,
  ): Promise<EnvironmentVariable[]> {
    const environments = await this._bitbucket.listEnvironments(workspace, repoSlug);
    const env = environments.find((e) => e.name === envName);
    if (!env) {
      throw new EnvironmentNotFoundError(envName);
    }
    return this._bitbucket.listEnvironmentVariables(workspace, repoSlug, env.uuid);
  }
}
