export interface IGitClient {
  fetch(branch: string): Promise<void>;
  checkout(branch: string): Promise<void>;
}
