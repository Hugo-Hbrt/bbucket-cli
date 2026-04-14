import { NoCommitsAheadError } from "../domain/errors.js";
import type {
  Comment,
  Commit,
  PullRequest,
  PullRequestDetails,
  PullRequestState,
} from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";
import type { IGitClient } from "../ports/IGitClient.js";
import type { IPullRequestPrompter } from "../ports/IPullRequestPrompter.js";

export type CreatePullRequestInput = {
  title?: string;
  description?: string;
  sourceBranch: string;
  destinationBranch: string;
};

export type PullRequestFilters = {
  destinationBranch?: string;
  state?: PullRequestState;
};

export class PullRequestService {
  private readonly _bitbucket: IBitbucketClient;
  private readonly _prompter: IPullRequestPrompter;
  private readonly _git: IGitClient;

  constructor(bitbucket: IBitbucketClient, prompter: IPullRequestPrompter, git: IGitClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    if (!prompter) {
      throw new Error("IPullRequestPrompter is required");
    }
    if (!git) {
      throw new Error("IGitClient is required");
    }
    this._bitbucket = bitbucket;
    this._prompter = prompter;
    this._git = git;
  }

  async list(
    workspace: string,
    repoSlug: string,
    filters: PullRequestFilters = {},
  ): Promise<PullRequest[]> {
    const prs = await this._bitbucket.listPullRequests(workspace, repoSlug, {
      state: filters.state,
    });
    if (filters.destinationBranch === undefined) {
      return prs;
    }
    return prs.filter((pr) => pr.destinationBranch === filters.destinationBranch);
  }

  async view(workspace: string, repoSlug: string, id: number): Promise<PullRequestDetails> {
    return this._bitbucket.getPullRequest(workspace, repoSlug, id);
  }

  async diff(workspace: string, repoSlug: string, id: number): Promise<string> {
    return this._bitbucket.getPullRequestDiff(workspace, repoSlug, id);
  }

  async checkout(workspace: string, repoSlug: string, id: number): Promise<string> {
    const pr = await this._bitbucket.getPullRequest(workspace, repoSlug, id);
    await this._git.fetch(pr.sourceBranch);
    await this._git.checkout(pr.sourceBranch);
    return pr.sourceBranch;
  }

  async approve(workspace: string, repoSlug: string, id: number): Promise<void> {
    await this._bitbucket.approvePullRequest(workspace, repoSlug, id);
  }

  async unapprove(workspace: string, repoSlug: string, id: number): Promise<void> {
    await this._bitbucket.unapprovePullRequest(workspace, repoSlug, id);
  }

  async requestChanges(workspace: string, repoSlug: string, id: number): Promise<void> {
    await this._bitbucket.requestChangesOnPullRequest(workspace, repoSlug, id);
  }

  async unrequestChanges(workspace: string, repoSlug: string, id: number): Promise<void> {
    await this._bitbucket.unrequestChangesOnPullRequest(workspace, repoSlug, id);
  }

  async commits(workspace: string, repoSlug: string, id: number): Promise<Commit[]> {
    return this._bitbucket.listPullRequestCommits(workspace, repoSlug, id);
  }

  async create(
    workspace: string,
    repoSlug: string,
    input: CreatePullRequestInput,
  ): Promise<PullRequest> {
    const ahead = await this._bitbucket.getCommitsAhead(
      workspace,
      repoSlug,
      input.sourceBranch,
      input.destinationBranch,
    );
    if (ahead.length === 0) {
      throw new NoCommitsAheadError(input.sourceBranch, input.destinationBranch);
    }
    const title = input.title ?? (await this._prompter.promptForTitle());
    return this._bitbucket.createPullRequest(workspace, repoSlug, {
      title,
      description: input.description,
      sourceBranch: input.sourceBranch,
      destinationBranch: input.destinationBranch,
    });
  }

  async comments(
    workspace: string,
    repoSlug: string,
    id: number,
    filters: CommentFilters = {},
  ): Promise<Comment[]> {
    const all = await this._bitbucket.listPullRequestComments(workspace, repoSlug, id);
    return all.filter((c) => matchesCommentFilters(c, filters));
  }
}

export type CommentFilters = {
  unresolved?: boolean;
  resolved?: boolean;
};

function matchesCommentFilters(comment: Comment, filters: CommentFilters): boolean {
  if (filters.unresolved === true && comment.resolved === true) {
    return false;
  }
  if (filters.resolved === true && comment.resolved === false) {
    return false;
  }
  return true;
}
