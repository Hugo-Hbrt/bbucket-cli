import type {
  Branch,
  Comment,
  Commit,
  Environment,
  EnvironmentVariable,
  MaskedBbConfig,
  Pipeline,
  Preferences,
  PullRequest,
  PullRequestDetails,
} from "../domain/types.js";

export interface IOutputPort {
  authSaved(config: MaskedBbConfig, location: string): void;
  authShown(config: MaskedBbConfig, location: string): void;
  branchesListed(branches: Branch[]): void;
  preferencesShown(prefs: Preferences): void;
  pullRequestsListed(prs: PullRequest[]): void;
  pullRequestShown(pr: PullRequestDetails): void;
  pullRequestCreated(pr: PullRequest): void;
  pullRequestCheckedOut(branch: string): void;
  pullRequestActionApplied(action: string, prId: number): void;
  pullRequestDiffShown(diff: string): void;
  commitsListed(commits: Commit[]): void;
  commentsListed(comments: Comment[]): void;
  pipelinesListed(pipelines: Pipeline[]): void;
  pipelineShown(pipeline: Pipeline): void;
  pipelineTriggered(pipeline: Pipeline): void;
  environmentsListed(environments: Environment[]): void;
  environmentVariablesListed(variables: EnvironmentVariable[]): void;
}
