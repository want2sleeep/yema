import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";
import { DatabaseSeedService } from "./database-seed.service.js";

@Global()
@Module({
  providers: [PrismaService, DatabaseSeedService],
  exports: [PrismaService, DatabaseSeedService],
})
export class DatabaseModule {}

