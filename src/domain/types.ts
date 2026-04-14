export type BbConfig = {
  email: string;
  apiToken: string;
  workspace: string;
  repoSlug: string;
  apiBaseUrl?: string;
};

export type MaskedBbConfig = {
  email: string;
  apiToken: string;
  workspace: string;
  repoSlug: string;
};

export type Branch = {
  name: string;
  commitHash: string;
  author: string;
  updatedAt: Date;
};
