import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@yema/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() payload: RegisterRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(payload);
    this.authService.applySessionCookie(reply, result.sessionToken);
    return {
      user: result.user,
    };
  }

  @Post("login")
  async login(
    @Body() payload: LoginRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(payload);
    this.authService.applySessionCookie(reply, result.sessionToken);
    return {
      user: result.user,
    };
  }

  @Post("logout")
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    await this.authService.logout(request);
    this.authService.clearSessionCookie(reply);
    return {
      ok: true,
    };
  }

  @Get("me")
  async getCurrentUser(@Req() request: FastifyRequest): Promise<AuthResponse> {
    const user = await this.authService.requireUserFromRequest(request);
    return {
      user,
    };
  }
}
