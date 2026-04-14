import { OperationCancelledError } from "../domain/errors.js";
import type { Branch } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";
import type { IConfirmationPrompter } from "../ports/IConfirmationPrompter.js";

export type BranchFilters = {
  nameContains?: string;
  authorContains?: string;
};

export class BranchService {
  private readonly _bitbucket: IBitbucketClient;
  private readonly _confirm: IConfirmationPrompter;

  constructor(bitbucket: IBitbucketClient, confirm: IConfirmationPrompter) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    if (!confirm) {
      throw new Error("IConfirmationPrompter is required");
    }
    this._bitbucket = bitbucket;
    this._confirm = confirm;
  }

  async list(workspace: string, repoSlug: string, filters: BranchFilters = {}): Promise<Branch[]> {
    const branches = await this._bitbucket.listBranches(workspace, repoSlug);
    const sorted = [...branches].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return sorted.filter((branch) => matchesFilters(branch, filters));
  }

  async delete(
    workspace: string,
    repoSlug: string,
    branchName: string,
    skipConfirmation: boolean,
  ): Promise<void> {
    if (!skipConfirmation) {
      const ok = await this._confirm.confirm(`Delete branch "${branchName}"?`, false);
      if (!ok) {
        throw new OperationCancelledError();
      }
    }
    await this._bitbucket.deleteBranch(workspace, repoSlug, branchName);
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
