import type {
  Comment,
  Commit,
  PullRequest,
  PullRequestDetails,
  PullRequestState,
} from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

export type PullRequestFilters = {
  destinationBranch?: string;
  state?: PullRequestState;
};

export class PullRequestService {
  private readonly _bitbucket: IBitbucketClient;

  constructor(bitbucket: IBitbucketClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    this._bitbucket = bitbucket;
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

  async commits(workspace: string, repoSlug: string, id: number): Promise<Commit[]> {
    return this._bitbucket.listPullRequestCommits(workspace, repoSlug, id);
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
