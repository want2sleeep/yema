import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { CreateSubmissionRequest, EvaluationReport, Submission } from "@yema/shared";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../database/prisma.service.js";
import { ProblemsService } from "../problems/problems.service.js";
import { EvaluationQueueService } from "../queue/evaluation-queue.service.js";

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly problemsService: ProblemsService,
    private readonly evaluationQueueService: EvaluationQueueService,
  ) {}

  async create(payload: CreateSubmissionRequest) {
    await this.problemsService.getById(payload.problemId);
    const submissionId = randomUUID();

    const submission = await this.prismaService.submission.create({
      data: {
        id: submissionId,
        problemId: payload.problemId,
        userId: payload.userId,
        status: "queued",
        files: payload.files as any,
      },
    });

    try {
      await this.evaluationQueueService.enqueue({
        submissionId,
        problemId: payload.problemId,
      });
    } catch {
      await this.prismaService.submission.update({
        where: { id: submissionId },
        data: { status: "failed" },
      });
      throw new ServiceUnavailableException("Evaluation queue is currently unavailable");
    }

    return {
      submissionId,
      status: submission.status,
    };
  }

  async getById(id: string): Promise<Submission> {
    const submission = await this.prismaService.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }

    return {
      id: submission.id,
      problemId: submission.problemId,
      userId: submission.userId,
      status: submission.status as Submission["status"],
      files: submission.files as Submission["files"],
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    };
  }

  async getReport(id: string): Promise<EvaluationReport> {
    const submission = await this.prismaService.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }

    const report = await this.prismaService.evaluationReport.findUnique({
      where: { submissionId: id },
    });

    if (!report) {
      throw new NotFoundException(`Report for submission ${id} not found`);
    }

    return report.report as unknown as EvaluationReport;
  }
}
