import { Injectable, NotFoundException } from "@nestjs/common";
import { Problem, ProblemSummary } from "@yema/shared";
import { PrismaService } from "../database/prisma.service.js";

@Injectable()
export class ProblemsService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(): Promise<ProblemSummary[]> {
    const problems = await this.prismaService.problem.findMany({
      orderBy: {
        createdAt: "asc",
      },
    });

    return problems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty as ProblemSummary["difficulty"],
      shortDescription: problem.shortDescription,
      tags: problem.tags,
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
