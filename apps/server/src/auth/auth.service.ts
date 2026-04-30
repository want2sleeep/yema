import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { AuthUser, LoginRequest, RegisterRequest } from "@yema/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../database/prisma.service.js";

const SESSION_COOKIE = "yema_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type DatabaseUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(payload: RegisterRequest) {
    const email = payload.email.trim().toLowerCase();
    const name = payload.name.trim();
    const password = payload.password;

    this.validateCredentials({ email, name, password });

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("该邮箱已被注册。");
    }

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        passwordHash: this.hashPassword(password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const sessionToken = await this.createSession(user.id);

    return {
      user: this.serializeUser(user),
      sessionToken,
    };
  }

  async login(payload: LoginRequest) {
    const email = payload.email.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      throw new BadRequestException("请输入邮箱和密码。");
    }

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("邮箱或密码不正确。");
    }

    const sessionToken = await this.createSession(user.id);

    return {
      user: this.serializeUser(user),
      sessionToken,
    };
  }

  async logout(request: FastifyRequest) {
    const token = this.readSessionToken(request);

    if (!token) {
      return;
    }

    await this.prismaService.session.deleteMany({
      where: {
        tokenHash: this.hashSessionToken(token),
      },
    });
  }

  async requireUserFromRequest(request: FastifyRequest): Promise<AuthUser> {
    const user = await this.getUserFromRequest(request);

    if (!user) {
      throw new UnauthorizedException("请先登录。");
    }

    return user;
  }

  async getUserFromRequest(request: FastifyRequest): Promise<AuthUser | null> {
    const token = this.readSessionToken(request);

    if (!token) {
      return null;
    }

    const session = await this.prismaService.session.findUnique({
      where: {
        tokenHash: this.hashSessionToken(token),
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      await this.prismaService.session.delete({
        where: {
          id: session.id,
        },
      });
      return null;
    }

    return this.serializeUser(session.user);
  }

  applySessionCookie(reply: FastifyReply, sessionToken: string) {
    reply.header(
      "Set-Cookie",
      `${SESSION_COOKIE}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
        SESSION_TTL_MS / 1000,
      )}`,
    );
  }

  clearSessionCookie(reply: FastifyReply) {
    reply.header("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  }

  private validateCredentials({
    email,
    name,
    password,
  }: {
    email: string;
    name: string;
    password: string;
  }) {
    if (!email || !email.includes("@")) {
      throw new BadRequestException("请输入有效的邮箱地址。");
    }

    if (!name || name.length < 2) {
      throw new BadRequestException("昵称至少需要 2 个字符。");
    }

    if (!password || password.length < 8) {
      throw new BadRequestException("密码至少需要 8 个字符。");
    }
  }

  private async createSession(userId: string) {
    const sessionToken = randomBytes(32).toString("hex");

    await this.prismaService.session.create({
      data: {
        tokenHash: this.hashSessionToken(sessionToken),
        userId,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    return sessionToken;
  }

  private serializeUser(user: DatabaseUser): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [salt, savedKey] = storedHash.split(":");

    if (!salt || !savedKey) {
      return false;
    }

    const derivedKey = scryptSync(password, salt, 64);
    const savedBuffer = Buffer.from(savedKey, "hex");

    if (savedBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(savedBuffer, derivedKey);
  }

  private hashSessionToken(token: string) {
    return scryptSync(token, "yema-session", 64).toString("hex");
  }

  private readSessionToken(request: FastifyRequest) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(";").map((entry) => entry.trim());
    const sessionCookie = cookies.find((entry) => entry.startsWith(`${SESSION_COOKIE}=`));

    if (!sessionCookie) {
      return null;
    }

    return decodeURIComponent(sessionCookie.slice(SESSION_COOKIE.length + 1));
  }
}
