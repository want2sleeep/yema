import { Controller, Get, Param } from "@nestjs/common";
import { ProblemsService } from "./problems.service.js";

@Controller("api/problems")
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  async list() {
    return this.problemsService.list();
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    return this.problemsService.getById(id);
  }
}
