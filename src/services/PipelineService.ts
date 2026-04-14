import type { Pipeline } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

export class PipelineService {
  private readonly _bitbucket: IBitbucketClient;

  constructor(bitbucket: IBitbucketClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    this._bitbucket = bitbucket;
  }

  async list(workspace: string, repoSlug: string): Promise<Pipeline[]> {
    return this._bitbucket.listPipelines(workspace, repoSlug);
  }
}
