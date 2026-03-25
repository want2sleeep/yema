import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { extname } from "node:path";
import type { FastifyReply } from "fastify";
import { RuntimeStorageService } from "../storage/runtime-storage.service.js";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
};

@Controller("api/artifacts")
export class ArtifactsController {
  constructor(private readonly runtimeStorageService: RuntimeStorageService) {}

  @Get(":submissionId/:filename")
  async getArtifact(
    @Param("submissionId") submissionId: string,
    @Param("filename") filename: string,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const filePath = this.runtimeStorageService.resolveArtifactPath(submissionId, filename);

    try {
      await access(filePath);
    } catch {
      throw new NotFoundException(`Artifact ${filename} for submission ${submissionId} not found`);
    }

    reply.header("Content-Type", MIME_TYPES[extname(filePath).toLowerCase()] ?? "application/octet-stream");
    return new StreamableFile(createReadStream(filePath));
  }
}
