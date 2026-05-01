import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { ProblemsController } from "./problems.controller.js";
import { ProblemsService } from "./problems.service.js";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}
