import type {
  Branch,
  Comment,
  Commit,
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

  preferencesShown(prefs: Preferences): void {
    this.print(prefs);
  }

  pullRequestsListed(prs: PullRequest[]): void {
    this.print(prs);
  }

  pullRequestShown(pr: PullRequestDetails): void {
    this.print(pr);
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

  private print(data: unknown): void {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  }
}
