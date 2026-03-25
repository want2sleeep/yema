import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateSubmissionRequest,
  EvaluationReport,
  Submission,
  SubmissionStatus,
} from "@yema/shared";
import { randomUUID } from "node:crypto";
import { EvaluationPipelineService } from "../evaluation/pipeline/evaluation-pipeline.service.js";
import { ProblemsService } from "../problems/problems.service.js";

@Injectable()
export class SubmissionsService {
  private readonly submissions = new Map<string, Submission>();
  private readonly reports = new Map<string, EvaluationReport>();

  constructor(
    private readonly problemsService: ProblemsService,
    private readonly evaluationPipelineService: EvaluationPipelineService,
  ) {}

  async create(payload: CreateSubmissionRequest) {
    const problem = this.problemsService.getById(payload.problemId);
    const submissionId = randomUUID();
    const now = new Date().toISOString();

    const submission: Submission = {
      id: submissionId,
      problemId: payload.problemId,
      userId: payload.userId,
      status: "queued",
      files: payload.files,
      createdAt: now,
      updatedAt: now,
    };

    this.submissions.set(submissionId, submission);
    this.runEvaluation(submissionId, problem, payload.files).catch(() => {
      this.updateStatus(submissionId, "failed");
    });

    return {
      submissionId,
      status: submission.status,
    };
  }

  getById(id: string) {
    const submission = this.submissions.get(id);

    if (!submission) {
      throw new NotFoundException(`Submission ${id} not found`);
    }

    return submission;
  }

  getReport(id: string) {
    const report = this.reports.get(id);

    if (!report) {
      throw new NotFoundException(`Report for submission ${id} not found`);
    }

    return report;
  }

  private updateStatus(id: string, status: SubmissionStatus) {
    const submission = this.submissions.get(id);

    if (!submission) {
      return;
    }

    this.submissions.set(id, {
      ...submission,
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  private async runEvaluation(
    submissionId: string,
    problem: ReturnType<ProblemsService["getById"]>,
    files: CreateSubmissionRequest["files"],
  ) {
    this.updateStatus(submissionId, "running");
    await new Promise((resolve) => setTimeout(resolve, 600));
    const report = await this.evaluationPipelineService.run(problem, submissionId, files);
    this.reports.set(submissionId, report);
    this.updateStatus(submissionId, "completed");
  }
}
