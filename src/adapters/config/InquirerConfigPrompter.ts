import { input, password } from "@inquirer/prompts";

import type { BbConfig } from "../../domain/types.js";
import type { IConfigPrompter } from "../../ports/IConfigPrompter.js";

export class InquirerConfigPrompter implements IConfigPrompter {
  async promptForConfig(defaults: Partial<BbConfig>): Promise<BbConfig> {
    const email = await input({
      message: "Atlassian account email",
      default: defaults.email,
      validate: (value) => value.includes("@") || "Enter a valid email address",
    });

    const apiToken = await password({
      message: "Bitbucket API token",
      mask: "*",
      validate: (value) => value.length > 0 || "Token cannot be empty",
    });

    const workspace = await input({
      message: "Default workspace",
      default: defaults.workspace,
      validate: (value) => value.length > 0 || "Workspace cannot be empty",
    });

    const repoSlug = await input({
      message: "Default repository slug",
      default: defaults.repoSlug,
      validate: (value) => value.length > 0 || "Repository slug cannot be empty",
    });

    return { email, apiToken, workspace, repoSlug };
  }
}
