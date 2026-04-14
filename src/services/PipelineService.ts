import { PipelineWaitTimeoutError } from "../domain/errors.js";
import type { Pipeline, PipelineState } from "../domain/types.js";
import type { IBitbucketClient } from "../ports/IBitbucketClient.js";

type SleepFn = (ms: number) => Promise<void>;

const TERMINAL_STATES: readonly PipelineState[] = ["completed", "stopped", "halted"];
const POLL_INTERVAL_SECONDS = 5;

export class PipelineService {
  private readonly _bitbucket: IBitbucketClient;
  private readonly _sleep: SleepFn;

  constructor(bitbucket: IBitbucketClient, sleep: SleepFn) {
    if (!bitbucket) {
      throw new Error("IBitbucketClient is required");
    }
    if (!sleep) {
      throw new Error("SleepFn is required");
    }
    this._bitbucket = bitbucket;
    this._sleep = sleep;
  }

  async list(workspace: string, repoSlug: string): Promise<Pipeline[]> {
    return this._bitbucket.listPipelines(workspace, repoSlug);
  }

  async latest(workspace: string, repoSlug: string): Promise<Pipeline | null> {
    return this._bitbucket.getLatestPipeline(workspace, repoSlug);
  }

  async run(workspace: string, repoSlug: string, branch: string): Promise<Pipeline> {
    return this._bitbucket.triggerPipeline(workspace, repoSlug, { branch });
  }

  async runCustom(
    workspace: string,
    repoSlug: string,
    branch: string,
    customPipelineName: string,
  ): Promise<Pipeline> {
    return this._bitbucket.triggerPipeline(workspace, repoSlug, {
      branch,
      customPipelineName,
    });
  }

  async wait(
    workspace: string,
    repoSlug: string,
    pipelineUuid: string,
    timeoutSeconds: number,
  ): Promise<Pipeline> {
    const maxPolls = Math.floor(timeoutSeconds / POLL_INTERVAL_SECONDS) + 1;
    for (let i = 0; i < maxPolls; i += 1) {
      const pipeline = await this._bitbucket.getPipeline(workspace, repoSlug, pipelineUuid);
      if (TERMINAL_STATES.includes(pipeline.state)) {
        return pipeline;
      }
      if (i < maxPolls - 1) {
        await this._sleep(POLL_INTERVAL_SECONDS * 1000);
      }
    }
    throw new PipelineWaitTimeoutError(pipelineUuid, timeoutSeconds);
  }
}
