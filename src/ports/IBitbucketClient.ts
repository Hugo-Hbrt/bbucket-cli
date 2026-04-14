import type { Branch, PullRequest, PullRequestDetails, PullRequestState } from "../domain/types.js";

export type ListPullRequestsOptions = {
  state?: PullRequestState;
};

export interface IBitbucketClient {
  listBranches(workspace: string, repoSlug: string): Promise<Branch[]>;
  listPullRequests(
    workspace: string,
    repoSlug: string,
    options?: ListPullRequestsOptions,
  ): Promise<PullRequest[]>;
  getPullRequest(workspace: string, repoSlug: string, id: number): Promise<PullRequestDetails>;
}
