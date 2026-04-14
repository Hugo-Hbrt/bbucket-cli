import type { PullRequest, PullRequestDetails, PullRequestState } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

export type PullRequestFilters = {
  destinationBranch?: string;
  state?: PullRequestState;
};

export class PullRequestService {
  private readonly _bitbucket: IBitbucketClient;

  constructor(bitbucket: IBitbucketClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    this._bitbucket = bitbucket;
  }

  async list(
    workspace: string,
    repoSlug: string,
    filters: PullRequestFilters = {},
  ): Promise<PullRequest[]> {
    const prs = await this._bitbucket.listPullRequests(workspace, repoSlug, {
      state: filters.state,
    });
    if (filters.destinationBranch === undefined) {
      return prs;
    }
    return prs.filter((pr) => pr.destinationBranch === filters.destinationBranch);
  }

  async view(workspace: string, repoSlug: string, id: number): Promise<PullRequestDetails> {
    return this._bitbucket.getPullRequest(workspace, repoSlug, id);
  }

  async diff(workspace: string, repoSlug: string, id: number): Promise<string> {
    return this._bitbucket.getPullRequestDiff(workspace, repoSlug, id);
  }
}
