import { Injectable, NotFoundException } from "@nestjs/common";
import type { FavoriteProblem, FavoritesListResponse, ProblemSummary } from "@yema/shared";
import { PrismaService } from "../database/prisma.service.js";

type ProblemSummaryRecord = {
  id: string;
  title: string;
  difficulty: string;
  shortDescription: string;
  tags: string[];
};

@Injectable()
export class FavoritesService {
  constructor(private readonly prismaService: PrismaService) {}

  async list(userId: string): Promise<FavoritesListResponse> {
    const favorites = await this.prismaService.favorite.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            shortDescription: true,
            tags: true,
          },
        },
      },
    });

    const problems = favorites.map((favorite) => favorite.problem);
    const statuses = await this.getProblemStatuses(
      userId,
      problems.map((problem) => problem.id),
    );

    return problems.map((problem) => this.toFavoriteProblem(problem, statuses[problem.id]));
  }

  async add(userId: string, problemId: string): Promise<FavoriteProblem> {
    const problem = await this.getProblemSummaryOrThrow(problemId);

    await this.prismaService.favorite.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId,
        },
      },
      update: {},
      create: {
        userId,
        problemId,
      },
    });

    return this.toFavoriteProblem(problem, await this.getProblemStatus(userId, problemId));
  }

  async remove(userId: string, problemId: string): Promise<FavoriteProblem> {
    const problem = await this.getProblemSummaryOrThrow(problemId);

    await this.prismaService.favorite.deleteMany({
      where: {
        userId,
        problemId,
      },
    });

    return this.toFavoriteProblem(problem, await this.getProblemStatus(userId, problemId));
  }

  private async getProblemSummaryOrThrow(problemId: string): Promise<ProblemSummaryRecord> {
    const problem = await this.prismaService.problem.findUnique({
      where: { id: problemId },
      select: {
        id: true,
        title: true,
        difficulty: true,
        shortDescription: true,
        tags: true,
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem ${problemId} not found`);
    }

    return problem;
  }

  private async getProblemStatus(userId: string, problemId: string) {
    const statuses = await this.getProblemStatuses(userId, [problemId]);
    return statuses[problemId];
  }

  private async getProblemStatuses(userId: string, problemIds: string[]) {
    if (problemIds.length === 0) {
      return {} as Record<string, ProblemSummary["status"]>;
    }

    const submissions = await this.prismaService.submission.findMany({
      where: {
        userId,
        problemId: {
          in: problemIds,
        },
      },
      select: {
        problemId: true,
        status: true,
      },
    });

    const statuses: Record<string, ProblemSummary["status"]> = {};

    for (const submission of submissions) {
      if (submission.status === "completed") {
        statuses[submission.problemId] = "solved";
        continue;
      }

      if (!statuses[submission.problemId]) {
        statuses[submission.problemId] = "attempted";
      }
    }

    return statuses;
  }

  private toFavoriteProblem(
    problem: ProblemSummaryRecord,
    status?: ProblemSummary["status"],
  ): FavoriteProblem {
    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty as ProblemSummary["difficulty"],
      shortDescription: problem.shortDescription,
      tags: problem.tags,
      status: status ?? "unstarted",
    };
  }
}
