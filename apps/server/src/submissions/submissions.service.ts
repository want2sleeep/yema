import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { CreateSubmissionRequest, EvaluationReport, Submission, SubmissionSummary } from "@yema/shared";
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
      throw new ServiceUnavailableException("评测队列暂时不可用。");
    }

    return {
      submissionId,
      status: submission.status,
    };
  }

  async list(): Promise<SubmissionSummary[]> {
    const submissions = await this.prismaService.submission.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
      select: {
        id: true,
        problemId: true,
        userId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        problem: {
          select: {
            title: true,
          },
        },
        report: {
          select: {
            report: true,
          },
        },
      },
    });

    return submissions.map((submission) => {
      const report = submission.report?.report as EvaluationReport | undefined;

      return {
        id: submission.id,
        problemId: submission.problemId,
        problemTitle: submission.problem.title,
        userId: submission.userId,
        status: submission.status as Submission["status"],
        totalScore: report?.totalScore,
        reportSummary: report?.summary,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
      };
    });
  }

  async getById(id: string): Promise<Submission> {
    const submission = await this.prismaService.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`未找到提交记录：${id}`);
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
      throw new NotFoundException(`未找到提交记录：${id}`);
    }

    const report = await this.prismaService.evaluationReport.findUnique({
      where: { submissionId: id },
    });

    if (!report) {
      throw new NotFoundException(`未找到提交 ${id} 对应的评测报告。`);
    }

    return report.report as unknown as EvaluationReport;
  }
}

