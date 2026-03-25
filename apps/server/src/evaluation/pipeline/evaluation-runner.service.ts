import { Injectable, Logger } from "@nestjs/common";
import { SubmissionFile } from "@yema/shared";
import { PrismaService } from "../../database/prisma.service.js";
import { ProblemsService } from "../../problems/problems.service.js";
import { EvaluationPipelineService } from "./evaluation-pipeline.service.js";

@Injectable()
export class EvaluationRunnerService {
  private readonly logger = new Logger(EvaluationRunnerService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly problemsService: ProblemsService,
    private readonly evaluationPipelineService: EvaluationPipelineService,
  ) {}

  async runSubmission(submissionId: string) {
    const submissionRecord = await this.prismaService.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submissionRecord) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    await this.prismaService.submission.update({
      where: { id: submissionId },
      data: { status: "running" },
    });

    try {
      const problem = await this.problemsService.getById(submissionRecord.problemId);
      const files = submissionRecord.files as unknown as SubmissionFile[];
      const report = await this.evaluationPipelineService.run(problem, submissionId, files);

      await this.prismaService.evaluationReport.upsert({
        where: { submissionId },
        create: {
          submissionId,
          problemId: problem.id,
          report: report as any,
        },
        update: {
          problemId: problem.id,
          report: report as any,
        },
      });

      await this.prismaService.submission.update({
        where: { id: submissionId },
        data: { status: "completed" },
      });
    } catch (error) {
      await this.prismaService.submission.update({
        where: { id: submissionId },
        data: { status: "failed" },
      });
      this.logger.error(`Submission ${submissionId} failed`, error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
