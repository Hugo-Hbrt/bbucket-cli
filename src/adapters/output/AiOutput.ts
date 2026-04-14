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

export class AiOutput implements IOutputPort {
  authSaved(_config: MaskedBbConfig, location: string): void {
    process.stdout.write(`saved ${location}\n`);
  }

  authShown(config: MaskedBbConfig, _location: string): void {
    process.stdout.write(
      `email=${config.email}\ttoken=${config.apiToken}\tworkspace=${config.workspace}\trepo=${config.repoSlug}\n`,
    );
  }

  branchesListed(branches: Branch[]): void {
    for (const branch of branches) {
      const shortHash = branch.commitHash.slice(0, 7);
      const date = branch.updatedAt.toISOString().slice(0, 10);
      process.stdout.write(`${branch.name}\t${shortHash}\t${branch.author}\t${date}\n`);
    }
  }

  preferencesShown(prefs: Preferences): void {
    process.stdout.write(`output-style=${prefs.outputStyle}\n`);
  }

  pullRequestsListed(prs: PullRequest[]): void {
    for (const pr of prs) {
      process.stdout.write(`${pr.id}\t${pr.title}\n`);
    }
  }

  pullRequestDiffShown(diff: string): void {
    process.stdout.write(diff);
  }

  commitsListed(commits: Commit[]): void {
    for (const commit of commits) {
      process.stdout.write(`${commit.hash.slice(0, 7)}\t${commit.message}\n`);
    }
  }

  pullRequestShown(pr: PullRequestDetails): void {
    process.stdout.write(`id=${pr.id}\ttitle=${pr.title}\n`);
    if (pr.description.length > 0) {
      process.stdout.write(`description=${pr.description}\n`);
    }
  }

  pullRequestCreated(pr: PullRequest): void {
    process.stdout.write(
      `created=${pr.id}\ttitle=${pr.title}\t${pr.sourceBranch}->${pr.destinationBranch}\n`,
    );
  }

  pullRequestCheckedOut(branch: string): void {
    process.stdout.write(`checked-out=${branch}\n`);
  }

  commentsListed(comments: Comment[]): void {
    for (const comment of comments) {
      const date = comment.createdOn.toISOString().slice(0, 10);
      process.stdout.write(`${date}\t${comment.author}\t${comment.content}\n`);
    }
  }

  pipelinesListed(pipelines: Pipeline[]): void {
    for (const pipeline of pipelines) {
      process.stdout.write(`${pipeline.buildNumber}\n`);
    }
  }

  pipelineShown(pipeline: Pipeline): void {
    const parts = [
      `#${pipeline.buildNumber}`,
      `branch=${pipeline.branch}`,
      `trigger=${pipeline.trigger}`,
      `state=${pipeline.state}`,
    ];
    if (pipeline.result) {
      parts.push(`result=${pipeline.result}`);
    }
    parts.push(`duration=${pipeline.durationSeconds}s`);
    process.stdout.write(`${parts.join("\t")}\n`);
  }

  environmentsListed(environments: Environment[]): void {
    for (const env of environments) {
      process.stdout.write(`${env.name}\t${env.uuid}\t${env.type}\n`);
    }
  }

  environmentVariablesListed(variables: EnvironmentVariable[]): void {
    for (const variable of variables) {
      const value = variable.secured ? "****" : variable.value;
      process.stdout.write(`${variable.key}=${value}\tsecured=${variable.secured}\n`);
    }
  }
}
