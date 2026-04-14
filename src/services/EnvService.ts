import {
  EnvironmentNotFoundError,
  EnvironmentVariableNotFoundError,
  OperationCancelledError,
} from "../domain/errors.js";
import type { Environment, EnvironmentVariable } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";
import type { IConfirmationPrompter } from "../ports/IConfirmationPrompter.js";

export class EnvService {
  private readonly _bitbucket: IBitbucketClient;
  private readonly _confirm: IConfirmationPrompter;

  constructor(bitbucket: IBitbucketClient, confirm: IConfirmationPrompter) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    if (!confirm) {
      throw new Error("IConfirmationPrompter is required");
    }
    this._bitbucket = bitbucket;
    this._confirm = confirm;
  }

  async list(workspace: string, repoSlug: string): Promise<Environment[]> {
    return this._bitbucket.listEnvironments(workspace, repoSlug);
  }

  async variables(
    workspace: string,
    repoSlug: string,
    envUuid: string,
  ): Promise<EnvironmentVariable[]> {
    return this._bitbucket.listEnvironmentVariables(workspace, repoSlug, envUuid);
  }

  async variablesByName(
    workspace: string,
    repoSlug: string,
    envName: string,
  ): Promise<EnvironmentVariable[]> {
    const environments = await this._bitbucket.listEnvironments(workspace, repoSlug);
    const env = environments.find((e) => e.name === envName);
    if (!env) {
      throw new EnvironmentNotFoundError(envName);
    }
    return this._bitbucket.listEnvironmentVariables(workspace, repoSlug, env.uuid);
  }

  async createVariable(
    workspace: string,
    repoSlug: string,
    envUuid: string,
    key: string,
    value: string,
    secured: boolean,
  ): Promise<EnvironmentVariable> {
    const existing = await this._bitbucket.listEnvironmentVariables(workspace, repoSlug, envUuid);
    const match = existing.find((v) => v.key === key);
    if (match) {
      const ok = await this._confirm.confirm(`Variable "${key}" already exists. Override?`, false);
      if (!ok) {
        throw new OperationCancelledError();
      }
      return this._bitbucket.updateEnvironmentVariable(
        workspace,
        repoSlug,
        envUuid,
        match.uuid,
        key,
        value,
        secured,
      );
    }
    return this._bitbucket.createEnvironmentVariable(
      workspace,
      repoSlug,
      envUuid,
      key,
      value,
      secured,
    );
  }

  async updateVariable(
    workspace: string,
    repoSlug: string,
    envUuid: string,
    varUuid: string,
    key: string,
    value: string,
    secured: boolean,
  ): Promise<EnvironmentVariable> {
    const existing = await this._bitbucket.listEnvironmentVariables(workspace, repoSlug, envUuid);
    const match = existing.find((v) => v.uuid === varUuid);
    if (!match) {
      throw new EnvironmentVariableNotFoundError(varUuid);
    }
    return this._bitbucket.updateEnvironmentVariable(
      workspace,
      repoSlug,
      envUuid,
      varUuid,
      key,
      value,
      secured,
    );
  }

  async deleteVariable(
    workspace: string,
    repoSlug: string,
    envUuid: string,
    varUuid: string,
    skipConfirmation: boolean,
  ): Promise<void> {
    if (!skipConfirmation) {
      const ok = await this._confirm.confirm(`Delete variable ${varUuid} from ${envUuid}?`, false);
      if (!ok) {
        throw new OperationCancelledError();
      }
    }
    return this._bitbucket.deleteEnvironmentVariable(workspace, repoSlug, envUuid, varUuid);
  }
}
