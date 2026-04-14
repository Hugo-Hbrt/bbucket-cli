export abstract class DomainError extends Error {
  abstract readonly userMessage: string;
}

export class BbConfigNotFoundError extends DomainError {
  readonly userMessage = "No credentials saved. Run 'bb auth' to set them up.";

  constructor() {
    super("No Bitbucket credentials saved");
    this.name = "BbConfigNotFoundError";
  }
}

export class InvalidConfigError extends DomainError {
  readonly userMessage: string;

  constructor(details: string) {
    super(`Invalid config: ${details}`);
    this.name = "InvalidConfigError";
    this.userMessage = `Invalid ~/.bb-cli-config.json: ${details}`;
  }
}

export class EnvironmentNotFoundError extends DomainError {
  readonly userMessage: string;

  constructor(name: string) {
    super(`No environment named "${name}"`);
    this.name = "EnvironmentNotFoundError";
    this.userMessage = `No deployment environment named "${name}". Run 'bb env list' to see available environments.`;
  }
}
