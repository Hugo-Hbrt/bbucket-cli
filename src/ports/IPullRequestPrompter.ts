export interface IPullRequestPrompter {
  promptForTitle(): Promise<string>;
}
