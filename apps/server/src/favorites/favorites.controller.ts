import { Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import type { FavoriteProblem, FavoritesListResponse } from "@yema/shared";
import type { FastifyRequest } from "fastify";
import { AuthService } from "../auth/auth.service.js";
import { FavoritesService } from "./favorites.service.js";

@Controller("api/favorites")
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async list(@Req() request: FastifyRequest): Promise<FavoritesListResponse> {
    const user = await this.authService.requireUserFromRequest(request);
    return this.favoritesService.list(user.id);
  }

  @Post(":problemId")
  async add(
    @Req() request: FastifyRequest,
    @Param("problemId") problemId: string,
  ): Promise<FavoriteProblem> {
    const user = await this.authService.requireUserFromRequest(request);
    return this.favoritesService.add(user.id, problemId);
  }

  @Delete(":problemId")
  async remove(
    @Req() request: FastifyRequest,
    @Param("problemId") problemId: string,
  ): Promise<FavoriteProblem> {
    const user = await this.authService.requireUserFromRequest(request);
    return this.favoritesService.remove(user.id, problemId);
  }
}
