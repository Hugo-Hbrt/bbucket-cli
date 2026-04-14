import type { Branch, MaskedBbConfig, Preferences, PullRequest } from "../../domain/types.js";
import type { IOutputPort } from "../../ports/IOutputPort.js";

export class AiOutput implements IOutputPort {
  authSaved(_config: MaskedBbConfig, location: string): void {
    process.stdout.write(`saved ${location}\n`);
  }

  authShown(config: MaskedBbConfig, _location: string): void {
    process.stdout.write(
      `email=${config.email}\ttoken=${config.apiToken}\tworkspace=${config.workspace}\trepo=${config.repoSlug}\n`,
    );
  }

  branchesListed(branches: Branch[]): void {
    for (const branch of branches) {
      const shortHash = branch.commitHash.slice(0, 7);
      const date = branch.updatedAt.toISOString().slice(0, 10);
      process.stdout.write(`${branch.name}\t${shortHash}\t${branch.author}\t${date}\n`);
    }
  }

  preferencesShown(prefs: Preferences): void {
    process.stdout.write(`output-style=${prefs.outputStyle}\n`);
  }

  pullRequestsListed(prs: PullRequest[]): void {
    for (const pr of prs) {
      process.stdout.write(`${pr.id}\t${pr.title}\n`);
    }
  }
}
