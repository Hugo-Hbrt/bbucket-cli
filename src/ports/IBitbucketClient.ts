import type {
  Branch,
  Comment,
  Commit,
  Environment,
  EnvironmentVariable,
  Pipeline,
  PullRequest,
  PullRequestDetails,
  PullRequestState,
} from "../domain/types.js";

export type ListPullRequestsOptions = {
  state?: PullRequestState;
};

export type CreatePullRequestParams = {
  title: string;
  description?: string;
  sourceBranch: string;
  destinationBranch: string;
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
  createPullRequest(
    workspace: string,
    repoSlug: string,
    params: CreatePullRequestParams,
  ): Promise<PullRequest>;
  getCommitsAhead(
    workspace: string,
    repoSlug: string,
    source: string,
    destination: string,
  ): Promise<Commit[]>;
  approvePullRequest(workspace: string, repoSlug: string, id: number): Promise<void>;
  unapprovePullRequest(workspace: string, repoSlug: string, id: number): Promise<void>;
  requestChangesOnPullRequest(workspace: string, repoSlug: string, id: number): Promise<void>;
  unrequestChangesOnPullRequest(workspace: string, repoSlug: string, id: number): Promise<void>;
  listPullRequestCommits(workspace: string, repoSlug: string, id: number): Promise<Commit[]>;
  listPullRequestComments(workspace: string, repoSlug: string, id: number): Promise<Comment[]>;
  listPipelines(workspace: string, repoSlug: string): Promise<Pipeline[]>;
  getLatestPipeline(workspace: string, repoSlug: string): Promise<Pipeline | null>;
  listEnvironments(workspace: string, repoSlug: string): Promise<Environment[]>;
  listEnvironmentVariables(
    workspace: string,
    repoSlug: string,
    envUuid: string,
  ): Promise<EnvironmentVariable[]>;
}
