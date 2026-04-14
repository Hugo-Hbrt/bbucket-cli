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

  async latest(workspace: string, repoSlug: string): Promise<Pipeline | null> {
    return this._bitbucket.getLatestPipeline(workspace, repoSlug);
  }

  async run(workspace: string, repoSlug: string, branch: string): Promise<Pipeline> {
    return this._bitbucket.triggerPipeline(workspace, repoSlug, { branch });
  }

  async runCustom(
    workspace: string,
    repoSlug: string,
    branch: string,
    customPipelineName: string,
  ): Promise<Pipeline> {
    return this._bitbucket.triggerPipeline(workspace, repoSlug, {
      branch,
      customPipelineName,
    });
  }
}
