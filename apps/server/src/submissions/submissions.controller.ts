import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import type { CreateSubmissionRequest } from "@yema/shared";
import type { FastifyRequest } from "fastify";
import { AuthService } from "../auth/auth.service.js";
import { SubmissionsService } from "./submissions.service.js";

@Controller("api/submissions")
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest) {
    const user = await this.authService.requireUserFromRequest(request);
    return this.submissionsService.list(user.id);
  }

  @Post()
  async create(@Req() request: FastifyRequest, @Body() payload: CreateSubmissionRequest) {
    const user = await this.authService.requireUserFromRequest(request);
    return this.submissionsService.create(user.id, payload);
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.submissionsService.getById(id);
  }

  @Get(":id/report")
  async getReport(@Param("id") id: string) {
    return this.submissionsService.getReport(id);
  }
}
