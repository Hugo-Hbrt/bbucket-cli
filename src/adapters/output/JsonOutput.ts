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
} from "../../domain/types.js";
import type { IOutputPort } from "../../ports/IOutputPort.js";

export class JsonOutput implements IOutputPort {
  authSaved(config: MaskedBbConfig, _location: string): void {
    this.print(config);
  }

  authShown(config: MaskedBbConfig, _location: string): void {
    this.print(config);
  }

  branchesListed(branches: Branch[]): void {
    this.print(branches);
  }

  branchDeleted(branchName: string): void {
    this.print({ deleted: branchName });
  }

  preferencesShown(prefs: Preferences): void {
    this.print(prefs);
  }

  pullRequestsListed(prs: PullRequest[]): void {
    this.print(prs);
  }

  pullRequestShown(pr: PullRequestDetails): void {
    this.print(pr);
  }

  pullRequestCreated(pr: PullRequest): void {
    this.print(pr);
  }

  pullRequestCheckedOut(branch: string): void {
    this.print({ checkedOut: branch });
  }

  pullRequestActionApplied(action: string, prId: number): void {
    this.print({ action, prId });
  }

  pullRequestDiffShown(diff: string): void {
    process.stdout.write(diff);
  }

  commitsListed(commits: Commit[]): void {
    this.print(commits);
  }

  commentsListed(comments: Comment[]): void {
    this.print(comments);
  }

  pipelinesListed(pipelines: Pipeline[]): void {
    this.print(pipelines);
  }

  pipelineShown(pipeline: Pipeline): void {
    this.print(pipeline);
  }

  pipelineTriggered(pipeline: Pipeline): void {
    this.print(pipeline);
  }

  environmentsListed(environments: Environment[]): void {
    this.print(environments);
  }

  environmentVariablesListed(variables: EnvironmentVariable[]): void {
    this.print(variables);
  }

  environmentVariableSaved(variable: EnvironmentVariable): void {
    this.print(variable);
  }

  environmentVariableDeleted(varUuid: string): void {
    this.print({ deleted: varUuid });
  }

  private print(data: unknown): void {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  }
}
