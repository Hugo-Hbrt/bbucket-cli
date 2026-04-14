import type {
  Branch,
  Comment,
  Commit,
  Environment,
  Pipeline,
  PullRequest,
  PullRequestDetails,
  PullRequestState,
} from "../domain/types.js";

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
  getPullRequestDiff(workspace: string, repoSlug: string, id: number): Promise<string>;
  listPullRequestCommits(workspace: string, repoSlug: string, id: number): Promise<Commit[]>;
  listPullRequestComments(workspace: string, repoSlug: string, id: number): Promise<Comment[]>;
  listPipelines(workspace: string, repoSlug: string): Promise<Pipeline[]>;
  getLatestPipeline(workspace: string, repoSlug: string): Promise<Pipeline | null>;
  listEnvironments(workspace: string, repoSlug: string): Promise<Environment[]>;
}
