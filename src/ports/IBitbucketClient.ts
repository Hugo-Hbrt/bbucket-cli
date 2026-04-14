import type { Branch } from "../domain/types.js";

export interface IBitbucketClient {
  listBranches(workspace: string, repoSlug: string): Promise<Branch[]>;
}
