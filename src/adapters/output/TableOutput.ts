import Table from "cli-table3";

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

type TableOptions = ConstructorParameters<typeof Table>[0];

function createTable(options: TableOptions): Table.Table {
  if (process.env.NO_COLOR) {
    return new Table({
      ...options,
      style: { head: [], border: [], ...(options?.style ?? {}) },
    });
  }
  return new Table(options);
}

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

  commentsListed(comments: Comment[]): void {
    const table = createTable({
      head: ["Author", "Date", "Comment"],
      colWidths: [20, 12, 80],
      wordWrap: true,
      wrapOnWordBoundary: true,
    });
    for (const comment of comments) {
      table.push([
        comment.author,
        comment.createdOn.toISOString().slice(0, 10),
        formatCommentText(comment),
      ]);
    }
    process.stdout.write(`${table.toString()}\n`);
  }

  commitsListed(commits: Commit[]): void {
    const table = createTable({
      head: ["Commit", "Author", "Date", "Message"],
      colWidths: [9, 20, 12, 60],
      wordWrap: true,
      wrapOnWordBoundary: true,
    });
    for (const commit of commits) {
      table.push([
        commit.hash.slice(0, 7),
        commit.author,
        commit.date.toISOString().slice(0, 10),
        firstLine(commit.message),
      ]);
    }
    process.stdout.write(`${table.toString()}\n`);
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
    const table = createTable({
      head: ["ID", "Title", "Author", "Branches", "State", "Created"],
      colWidths: [6, 50, 20, 30, 12, 12],
      wordWrap: true,
      wrapOnWordBoundary: true,
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
    const table = createTable({
      head: ["Branch", "Commit", "Author", "Updated"],
      colWidths: [50, 9, 20, 12],
      wordWrap: true,
      wrapOnWordBoundary: true,
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

function firstLine(text: string): string {
  const newlineIndex = text.indexOf("\n");
  return newlineIndex === -1 ? text : text.slice(0, newlineIndex);
}

const MAX_COMMENT_CELL_CHARS = 1000;

function formatCommentText(comment: Comment): string {
  const body = truncate(comment.content, MAX_COMMENT_CELL_CHARS);
  if (!comment.inline) {
    return body;
  }
  const location =
    comment.inline.line !== null
      ? `${comment.inline.path}:${comment.inline.line}`
      : comment.inline.path;
  return `[${location}] ${body}`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
}
