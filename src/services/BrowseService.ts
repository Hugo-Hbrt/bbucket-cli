import type { IBrowserOpener } from "../ports/IBrowserOpener.js";
import type { IGitClient } from "../ports/IGitClient.js";

const BITBUCKET_WEB = "https://bitbucket.org";

export class BrowseService {
  private readonly _opener: IBrowserOpener;
  private readonly _git: IGitClient;

  constructor(opener: IBrowserOpener, git: IGitClient) {
    if (!opener) {
      throw new Error("IBrowserOpener is required");
    }
    if (!git) {
      throw new Error("IGitClient is required");
    }
    this._opener = opener;
    this._git = git;
  }

  async repo(workspace: string, repoSlug: string): Promise<string> {
    const url = `${BITBUCKET_WEB}/${workspace}/${repoSlug}`;
    await this._opener.open(url);
    return url;
  }

  async pullRequests(workspace: string, repoSlug: string): Promise<string> {
    const url = `${BITBUCKET_WEB}/${workspace}/${repoSlug}/pull-requests/`;
    await this._opener.open(url);
    return url;
  }

  async pipelines(workspace: string, repoSlug: string): Promise<string> {
    const url = `${BITBUCKET_WEB}/${workspace}/${repoSlug}/addon/pipelines/home`;
    await this._opener.open(url);
    return url;
  }

  async branch(workspace: string, repoSlug: string, branchName?: string): Promise<string> {
    const name = branchName ?? (await this._git.currentBranch());
    const url = `${BITBUCKET_WEB}/${workspace}/${repoSlug}/branch/${encodeURIComponent(name)}`;
    await this._opener.open(url);
    return url;
  }

  async pullRequest(workspace: string, repoSlug: string, id: number): Promise<string> {
    const url = `${BITBUCKET_WEB}/${workspace}/${repoSlug}/pull-requests/${id}`;
    await this._opener.open(url);
    return url;
  }
}
