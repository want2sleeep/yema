import { Controller, Get, Param, Req } from "@nestjs/common";
import { ProblemsService } from "./problems.service.js";
import { AuthService } from "../auth/auth.service.js";
import { FastifyRequest } from "fastify";

@Controller("api/problems")
export class ProblemsController {
  constructor(
    private readonly problemsService: ProblemsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest) {
    const user = await this.authService.getUserFromRequest(request);
    return this.problemsService.list(user?.id);
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.problemsService.getById(id);
  }
}
