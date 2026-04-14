import type { Branch } from "../../domain/types.js";
import type { IBitbucketClient } from "../../ports/IBitbucketClient.js";
import type { IConfigReader } from "../../ports/IConfigReader.js";

const DEFAULT_API_BASE_URL = "https://api.bitbucket.org";

type BitbucketBranchesResponse = {
  values: Array<{
    name: string;
    target: {
      hash: string;
      date: string;
      author: { user: { display_name: string } };
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
    const response = await this.get(`/2.0/repositories/${workspace}/${repoSlug}/refs/branches`);
    const data = (await response.json()) as BitbucketBranchesResponse;
    return data.values.map((v) => ({
      name: v.name,
      commitHash: v.target.hash,
      author: v.target.author.user.display_name,
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
