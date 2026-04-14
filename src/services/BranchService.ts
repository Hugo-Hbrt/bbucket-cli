import type { Branch } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

export type BranchFilters = {
  nameContains?: string;
  authorContains?: string;
};

export class BranchService {
  private readonly _bitbucket: IBitbucketClient;

  constructor(bitbucket: IBitbucketClient) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    this._bitbucket = bitbucket;
  }

  async list(workspace: string, repoSlug: string, filters: BranchFilters = {}): Promise<Branch[]> {
    const branches = await this._bitbucket.listBranches(workspace, repoSlug);
    const sorted = [...branches].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return sorted.filter((branch) => matchesFilters(branch, filters));
  }
}

function matchesFilters(branch: Branch, filters: BranchFilters): boolean {
  if (filters.nameContains !== undefined && !branch.name.includes(filters.nameContains)) {
    return false;
  }
  if (filters.authorContains !== undefined && !branch.author.includes(filters.authorContains)) {
    return false;
  }
  return true;
}
