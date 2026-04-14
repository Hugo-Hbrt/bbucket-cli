import Table from "cli-table3";

import type {
  Branch,
  MaskedBbConfig,
  Preferences,
  PullRequest,
  PullRequestDetails,
} from "../../domain/types.js";
import type { IOutputPort } from "../../ports/IOutputPort.js";

export class TableOutput implements IOutputPort {
  authSaved(_config: MaskedBbConfig, location: string): void {
    process.stdout.write(`Saved credentials to ${location}\n`);
  }

  authShown(config: MaskedBbConfig, location: string): void {
    process.stdout.write(`Config file: ${location}\n`);
    process.stdout.write(`Email:       ${config.email}\n`);
    process.stdout.write(`Token:       ${config.apiToken}\n`);
    process.stdout.write(`Workspace:   ${config.workspace}\n`);
    process.stdout.write(`Repo slug:   ${config.repoSlug}\n`);
  }

  preferencesShown(prefs: Preferences): void {
    process.stdout.write(`output-style: ${prefs.outputStyle}\n`);
  }

  pullRequestDiffShown(diff: string): void {
    process.stdout.write(diff);
  }

  pullRequestShown(pr: PullRequestDetails): void {
    process.stdout.write(`#${pr.id} ${pr.title}\n`);
    if (pr.description.length > 0) {
      process.stdout.write(`\n${pr.description}\n`);
    }
    if (pr.reviewers.length > 0) {
      process.stdout.write("\nReviewers:\n");
      for (const reviewer of pr.reviewers) {
        process.stdout.write(`  ${reviewer.name}: ${reviewer.state}\n`);
      }
    }
    process.stdout.write(`\nCommits: ${pr.commitCount}   Comments: ${pr.commentCount}\n`);
  }

  pullRequestsListed(prs: PullRequest[]): void {
    const table = new Table({
      head: ["ID", "Title", "Author", "Branches", "State", "Created"],
    });
    for (const pr of prs) {
      table.push([
        String(pr.id),
        pr.title,
        pr.author,
        `${pr.sourceBranch} → ${pr.destinationBranch}`,
        pr.state,
        pr.createdOn.toISOString().slice(0, 10),
      ]);
    }
    process.stdout.write(`${table.toString()}\n`);
  }

  branchesListed(branches: Branch[]): void {
    const table = new Table({
      head: ["Branch", "Commit", "Author", "Updated"],
    });
    for (const branch of branches) {
      table.push([
        branch.name,
        branch.commitHash.slice(0, 7),
        branch.author,
        branch.updatedAt.toISOString().slice(0, 10),
      ]);
    }
    process.stdout.write(`${table.toString()}\n`);
  }
}
