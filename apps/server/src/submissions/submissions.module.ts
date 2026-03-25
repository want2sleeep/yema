import { Module } from "@nestjs/common";
import { ProblemsModule } from "../problems/problems.module.js";
import { EvaluationModule } from "../evaluation/evaluation.module.js";
import { SubmissionsController } from "./submissions.controller.js";
import { SubmissionsService } from "./submissions.service.js";

@Module({
  imports: [ProblemsModule, EvaluationModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}

