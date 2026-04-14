import type { Branch } from "../../domain/types.js";
import type { IBitbucketClient } from "../../ports/IBitbucketClient.js";
import type { IConfigReader } from "../../ports/IConfigReader.js";

const DEFAULT_API_BASE_URL = "https://api.bitbucket.org";

type BitbucketAuthor = {
  raw?: string;
  user?: { display_name?: string };
};

type BitbucketBranchesResponse = {
  values: Array<{
    name: string;
    target: {
      hash: string;
      date: string;
      author: BitbucketAuthor;
    };
  }>;
};

export class HttpBitbucketClient implements IBitbucketClient {
  private readonly _config: IConfigReader;

  constructor(config: IConfigReader) {
    if (!config) {
      throw new Error("IConfigReader is required");
    }
    this._config = config;
  }

  async listBranches(workspace: string, repoSlug: string): Promise<Branch[]> {
    const response = await this.get(
      `/2.0/repositories/${workspace}/${repoSlug}/refs/branches?sort=-target.date&pagelen=100`,
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Bitbucket API ${response.status} ${response.statusText}: ${body}`);
    }
    const data = (await response.json()) as BitbucketBranchesResponse;
    return data.values.map((v) => ({
      name: v.name,
      commitHash: v.target.hash,
      author: extractAuthorName(v.target.author),
      updatedAt: new Date(v.target.date),
    }));
  }

  private async get(path: string): Promise<Response> {
    const config = await this._config.read();
    if (!config) {
      throw new Error("Config is required");
    }
    const baseUrl = config.apiBaseUrl ?? DEFAULT_API_BASE_URL;
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
    return fetch(`${baseUrl}${path}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
  }
}

function extractAuthorName(author: BitbucketAuthor): string {
  if (author.user?.display_name) {
    return author.user.display_name;
  }
  if (author.raw) {
    const match = author.raw.match(/^([^<]+)/);
    const name = match?.[1]?.trim();
    return name && name.length > 0 ? name : author.raw;
  }
  return "Unknown";
}
