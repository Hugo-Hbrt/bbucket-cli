import type {
  Branch,
  Comment,
  Commit,
  MaskedBbConfig,
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

  commentsListed(comments: Comment[]): void {
    for (const comment of comments) {
      const date = comment.createdOn.toISOString().slice(0, 10);
      process.stdout.write(`${date}\t${comment.author}\t${comment.content}\n`);
    }
  }
}
