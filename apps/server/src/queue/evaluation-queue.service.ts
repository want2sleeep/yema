import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import { EVALUATION_JOB, EVALUATION_QUEUE, EvaluationJobPayload } from "./queue.constants.js";

@Injectable()
export class EvaluationQueueService implements OnModuleInit, OnModuleDestroy {
  private queue!: Queue<EvaluationJobPayload>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.queue = new Queue<EvaluationJobPayload>(EVALUATION_QUEUE, {
      connection: this.getConnectionOptions(),
      defaultJobOptions: {
        attempts: 2,
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    });
  }

  async onModuleDestroy() {
    if (this.queue) {
      await this.queue.close();
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

  async enqueue(payload: EvaluationJobPayload) {
    await this.queue.add(EVALUATION_JOB, payload);
  }
}
