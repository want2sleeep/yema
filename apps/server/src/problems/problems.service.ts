import { Injectable, NotFoundException } from "@nestjs/common";
import { Problem, ProblemSummary } from "@yema/shared";
import { PrismaService } from "../database/prisma.service.js";

@Injectable()
export class ProblemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId?: string): Promise<ProblemSummary[]> {
    const problems = await this.prismaService.problem.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    let userSubmissions: Record<string, "solved" | "attempted"> = {};

    if (userId) {
      const submissions = await this.prismaService.submission.findMany({
        where: { userId },
        select: { problemId: true, status: true },
      });

      for (const sub of submissions) {
        if (sub.status === "completed") {
          userSubmissions[sub.problemId] = "solved";
        } else if (!userSubmissions[sub.problemId]) {
          userSubmissions[sub.problemId] = "attempted";
        }
      }
    }

    return problems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty as ProblemSummary["difficulty"],
      shortDescription: problem.shortDescription,
      tags: problem.tags,
      status: userSubmissions[problem.id] ?? "unstarted",
    }));
  }

  async getById(id: string): Promise<Problem> {
    const problem = await this.prismaService.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      throw new NotFoundException(`Problem ${id} not found`);
    }

    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty as ProblemSummary["difficulty"],
      shortDescription: problem.shortDescription,
      tags: problem.tags,
      description: problem.description,
      templateFiles: problem.templateFiles as Problem["templateFiles"],
      config: problem.config as Problem["config"],
    };
  }
}
