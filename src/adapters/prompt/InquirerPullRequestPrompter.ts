import { input } from "@inquirer/prompts";

import type { IPullRequestPrompter } from "../../ports/IPullRequestPrompter.js";

export class InquirerPullRequestPrompter implements IPullRequestPrompter {
  async promptForTitle(): Promise<string> {
    return input({
      message: "Pull request title",
      validate: (value) => value.length > 0 || "Title cannot be empty",
    });
  }
}
