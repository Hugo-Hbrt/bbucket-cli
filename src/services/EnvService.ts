import type { Environment } from "../domain/types.js";
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
}
