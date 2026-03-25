import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

@Injectable()
export class RuntimeStorageService {
  private readonly root = join(process.cwd(), "runtime");

  async ensureDir(pathSegment: string) {
    const fullPath = join(this.root, pathSegment);
    await mkdir(fullPath, { recursive: true });
    return fullPath;
  }

  async writeTextFile(pathSegment: string, filename: string, content: string) {
    const dir = await this.ensureDir(pathSegment);
    const filePath = join(dir, filename);
    await writeFile(filePath, content, "utf8");
    return filePath;
  }
}

