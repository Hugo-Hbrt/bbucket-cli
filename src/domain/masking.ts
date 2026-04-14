import type { BbConfig, MaskedBbConfig } from "./types.js";

export function maskToken(token: string): string {
  if (token.length === 0) {
    return "";
  }
  return "****";
}

export function maskConfig(config: BbConfig): MaskedBbConfig {
  return {
    email: config.email,
    apiToken: maskToken(config.apiToken),
    workspace: config.workspace,
    repoSlug: config.repoSlug,
  };
}
