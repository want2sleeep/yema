import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EvaluationModule } from "../evaluation/evaluation.module.js";
import { EvaluationQueueService } from "./evaluation-queue.service.js";
import { EvaluationWorker } from "./evaluation.worker.js";

@Module({
  imports: [ConfigModule, EvaluationModule],
  providers: [EvaluationQueueService, EvaluationWorker],
  exports: [EvaluationQueueService],
})
export class QueueModule {}

