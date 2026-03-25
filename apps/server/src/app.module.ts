import { Module } from "@nestjs/common";
import { HealthController } from "./common/health.controller.js";
import { ProblemsModule } from "./problems/problems.module.js";
import { SubmissionsModule } from "./submissions/submissions.module.js";
import { EvaluationModule } from "./evaluation/evaluation.module.js";
import { RuntimeStorageService } from "./storage/runtime-storage.service.js";

@Module({
  imports: [ProblemsModule, SubmissionsModule, EvaluationModule],
  controllers: [HealthController],
  providers: [RuntimeStorageService],
})
export class AppModule {}

