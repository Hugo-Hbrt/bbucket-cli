import { confirm } from "@inquirer/prompts";

import type { IConfirmationPrompter } from "../../ports/IConfirmationPrompter.js";

export class InquirerConfirmationPrompter implements IConfirmationPrompter {
  async confirm(message: string, defaultValue: boolean): Promise<boolean> {
    return confirm({ message, default: defaultValue });
  }
}
