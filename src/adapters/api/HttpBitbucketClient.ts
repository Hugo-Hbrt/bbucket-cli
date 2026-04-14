import type {
  Branch,
  Comment,
  Commit,
  Environment,
  Pipeline,
  PipelineResult,
  PipelineState,
  PullRequest,
  PullRequestDetails,
  PullRequestState,
  ReviewState,
} from "../../domain/types.js";
import type { IBitbucketClient, ListPullRequestsOptions } from "../../ports/IBitbucketClient.js";
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

type BitbucketPullRequestsResponse = {
  values: Array<{
    id: number;
    title: string;
    state: string;
    author: { display_name: string };
    source: { branch: { name: string } };
    destination: { branch: { name: string } };
    created_on: string;
  }>;
};

type BitbucketParticipant = {
  user: { display_name: string };
  role: "REVIEWER" | "PARTICIPANT";
  approved: boolean;
  state: "approved" | "changes_requested" | null;
};

type BitbucketPullRequestResponse = {
  id: number;
  title: string;
  summary?: { raw?: string };
  participants?: BitbucketParticipant[];
  comment_count?: number;
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

  async listPullRequests(
    workspace: string,
    repoSlug: string,
    options: ListPullRequestsOptions = {},
  ): Promise<PullRequest[]> {
    const params = new URLSearchParams();
    if (options.state) {
      params.set("state", options.state.toUpperCase());
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await this.get(
      `/2.0/repositories/${workspace}/${repoSlug}/pullrequests${query}`,
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Bitbucket API ${response.status} ${response.statusText}: ${body}`);
    }
    const data = (await response.json()) as BitbucketPullRequestsResponse;
    return data.values.map((v) => ({
      id: v.id,
      title: v.title,
      author: v.author.display_name,
      sourceBranch: v.source.branch.name,
      destinationBranch: v.destination.branch.name,
      state: v.state.toLowerCase() as PullRequestState,
      createdOn: new Date(v.created_on),
    }));
  }

  async getPullRequest(
    workspace: string,
    repoSlug: string,
    id: number,
  ): Promise<PullRequestDetails> {
    const base = `/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${id}`;
    const [detailResponse, commitsResponse] = await Promise.all([
      this.get(base),
      this.get(`${base}/commits`),
    ]);
    await ensureOk(detailResponse);
    await ensureOk(commitsResponse);

    const data = (await detailResponse.json()) as BitbucketPullRequestResponse;
    const commitsData = (await commitsResponse.json()) as { size?: number };

    return {
      id: data.id,
      title: data.title,
      description: data.summary?.raw ?? "",
      reviewers: (data.participants ?? [])
        .filter((p) => p.role === "REVIEWER")
        .map((p) => ({
          name: p.user.display_name,
          state: mapReviewState(p.state),
        })),
      commentCount: data.comment_count ?? 0,
      commitCount: commitsData.size ?? 0,
    };
  }

  async listPullRequestCommits(workspace: string, repoSlug: string, id: number): Promise<Commit[]> {
    type RawCommit = {
      hash: string;
      message: string;
      date: string;
      author: BitbucketAuthor;
    };
    const raw = await this.fetchAllPages<RawCommit>(
      `/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${id}/commits?pagelen=100`,
    );
    return raw.map((v) => ({
      hash: v.hash,
      message: v.message,
      author: extractAuthorName(v.author),
      date: new Date(v.date),
    }));
  }

  async listPullRequestComments(
    workspace: string,
    repoSlug: string,
    id: number,
  ): Promise<Comment[]> {
    type RawComment = {
      id: number;
      user: { display_name: string };
      content?: { raw?: string };
      created_on: string;
      inline?: { path: string; from?: number | null; to?: number | null };
      resolution?: unknown;
    };
    const raw = await this.fetchAllPages<RawComment>(
      `/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${id}/comments?pagelen=100`,
    );
    return raw.map((v) => ({
      id: v.id,
      author: v.user.display_name,
      content: v.content?.raw ?? "",
      createdOn: new Date(v.created_on),
      inline: v.inline
        ? { path: v.inline.path, line: v.inline.to ?? v.inline.from ?? null }
        : undefined,
      resolved: v.resolution !== null && v.resolution !== undefined,
    }));
  }

  async listPipelines(workspace: string, repoSlug: string): Promise<Pipeline[]> {
    const raw = await this.fetchAllPages<RawPipeline>(
      `/2.0/repositories/${workspace}/${repoSlug}/pipelines?pagelen=100`,
    );
    return raw.map(mapPipeline);
  }

  async getLatestPipeline(workspace: string, repoSlug: string): Promise<Pipeline | null> {
    const response = await this.get(
      `/2.0/repositories/${workspace}/${repoSlug}/pipelines?sort=-created_on&pagelen=1`,
    );
    await ensureOk(response);
    const data = (await response.json()) as { values?: RawPipeline[] };
    const first = data.values?.[0];
    return first ? mapPipeline(first) : null;
  }

  async listEnvironments(workspace: string, repoSlug: string): Promise<Environment[]> {
    type RawEnvironment = {
      uuid: string;
      name: string;
      environment_type?: { name?: string };
    };
    const raw = await this.fetchAllPages<RawEnvironment>(
      `/2.0/repositories/${workspace}/${repoSlug}/environments?pagelen=100`,
    );
    return raw.map((v) => ({
      uuid: v.uuid,
      name: v.name,
      type: v.environment_type?.name ?? "",
    }));
  }

  async getPullRequestDiff(workspace: string, repoSlug: string, id: number): Promise<string> {
    const response = await this.get(
      `/2.0/repositories/${workspace}/${repoSlug}/pullrequests/${id}/diff`,
    );
    await ensureOk(response);
    return response.text();
  }

  private async get(path: string): Promise<Response> {
    return this.fetchUrl(path);
  }

  private async fetchUrl(urlOrPath: string): Promise<Response> {
    const config = await this._config.read();
    if (!config) {
      throw new Error("Config is required");
    }
    const baseUrl = config.apiBaseUrl ?? DEFAULT_API_BASE_URL;
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
    const url = urlOrPath.startsWith("http") ? urlOrPath : `${baseUrl}${urlOrPath}`;
    return fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
  }

  protected async fetchAllPages<TRaw>(initialPath: string): Promise<TRaw[]> {
    const all: TRaw[] = [];
    let next: string | undefined = initialPath;
    while (next) {
      const response = await this.fetchUrl(next);
      await ensureOk(response);
      const data = (await response.json()) as { values?: TRaw[]; next?: string };
      if (data.values) {
        all.push(...data.values);
      }
      next = data.next;
    }
    return all;
  }
}

async function ensureOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }
  const body = await response.text();
  throw new Error(`Bitbucket API ${response.status} ${response.statusText}: ${body}`);
}

type RawPipeline = {
  build_number: number;
  target?: { ref_name?: string };
  trigger?: { type?: string };
  state?: { name?: string; result?: { name?: string } };
  created_on: string;
  build_seconds_used?: number;
};

function mapPipeline(v: RawPipeline): Pipeline {
  return {
    buildNumber: v.build_number,
    branch: v.target?.ref_name ?? "",
    trigger: stripTriggerPrefix(v.trigger?.type),
    state: (v.state?.name?.toLowerCase() ?? "pending") as PipelineState,
    result: v.state?.result?.name
      ? (v.state.result.name.toLowerCase() as PipelineResult)
      : undefined,
    createdOn: new Date(v.created_on),
    durationSeconds: v.build_seconds_used ?? 0,
  };
}

function stripTriggerPrefix(type: string | undefined): string {
  if (!type) {
    return "unknown";
  }
  return type.replace(/^pipeline_trigger_/, "").replace(/_/g, " ");
}

function mapReviewState(state: "approved" | "changes_requested" | null): ReviewState {
  if (state === "approved") {
    return "approved";
  }
  if (state === "changes_requested") {
    return "changes_requested";
  }
  return "pending";
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
