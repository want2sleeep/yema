import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import type { CreateSubmissionRequest } from "@yema/shared";
import { SubmissionsService } from "./submissions.service.js";

@Controller("api/submissions")
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  async create(@Body() payload: CreateSubmissionRequest) {
    return this.submissionsService.create(payload);
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.submissionsService.getById(id);
  }

  @Get(":id/report")
  getReport(@Param("id") id: string) {
    return this.submissionsService.getReport(id);
  }
}
