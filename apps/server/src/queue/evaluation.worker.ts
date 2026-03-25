import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Job, Worker } from "bullmq";
import { EvaluationRunnerService } from "../evaluation/pipeline/evaluation-runner.service.js";
import { EVALUATION_QUEUE, EvaluationJobPayload } from "./queue.constants.js";

@Injectable()
export class EvaluationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EvaluationWorker.name);
  private worker!: Worker<EvaluationJobPayload>;

  constructor(
    private readonly configService: ConfigService,
    private readonly evaluationRunnerService: EvaluationRunnerService,
  ) {}

  onModuleInit() {
    this.worker = new Worker<EvaluationJobPayload>(
      EVALUATION_QUEUE,
      async (job: Job<EvaluationJobPayload>) => {
        await this.evaluationRunnerService.runSubmission(job.data.submissionId);
      },
      {
        connection: this.getConnectionOptions(),
        concurrency: 1,
      },
    );

    this.worker.on("failed", (job, error) => {
      this.logger.error(`Evaluation job failed for ${job?.data.submissionId ?? "unknown"}`, error.stack);
    });
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }

  private getConnectionOptions() {
    const redisUrl = this.configService.get<string>("REDIS_URL") ?? "redis://127.0.0.1:6379";
    const parsed = new URL(redisUrl);

    return {
      host: parsed.hostname,
      port: Number(parsed.port || "6379"),
      maxRetriesPerRequest: null,
    };
  }
}
