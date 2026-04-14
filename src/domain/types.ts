export type OutputStyle = "normal" | "json" | "ai";

export const OUTPUT_STYLES: readonly OutputStyle[] = ["normal", "json", "ai"];

export function isValidOutputStyle(value: unknown): value is OutputStyle {
  return typeof value === "string" && (OUTPUT_STYLES as readonly string[]).includes(value);
}

export type Preferences = {
  outputStyle: OutputStyle;
};

export type BbConfig = {
  email: string;
  apiToken: string;
  workspace: string;
  repoSlug: string;
  apiBaseUrl?: string;
  outputStyle?: OutputStyle;
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
