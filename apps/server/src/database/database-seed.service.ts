import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { problemSeeds } from "./problem-seeds.js";

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit() {
    for (const problem of problemSeeds) {
      await this.prismaService.problem.upsert({
        where: { id: problem.id },
        create: {
          id: problem.id,
          title: problem.title,
          difficulty: problem.difficulty,
          shortDescription: problem.shortDescription,
          description: problem.description,
          templateFiles: problem.templateFiles as any,
          config: problem.config as any,
        },
        update: {
          title: problem.title,
          difficulty: problem.difficulty,
          shortDescription: problem.shortDescription,
          description: problem.description,
          templateFiles: problem.templateFiles as any,
          config: problem.config as any,
        },
      });
    }

    this.logger.log(`Seeded ${problemSeeds.length} problems`);
  }
}
