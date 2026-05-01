import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ArtifactsController } from "./common/artifacts.controller.js";
import { HealthController } from "./common/health.controller.js";
import { DatabaseModule } from "./database/database.module.js";
import { QueueModule } from "./queue/queue.module.js";
import { ProblemsModule } from "./problems/problems.module.js";
import { SubmissionsModule } from "./submissions/submissions.module.js";
import { EvaluationModule } from "./evaluation/evaluation.module.js";
import { RuntimeStorageService } from "./storage/runtime-storage.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { FavoritesModule } from "./favorites/favorites.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ProblemsModule,
    EvaluationModule,
    QueueModule,
    SubmissionsModule,
    AuthModule,
    FavoritesModule,
  ],
  controllers: [HealthController, ArtifactsController],
  providers: [RuntimeStorageService],
})
export class AppModule {}
