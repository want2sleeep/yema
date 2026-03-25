import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { SubmissionFile } from "@yema/shared";

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

  async writeSubmissionFiles(submissionId: string, files: SubmissionFile[]) {
    const workspaceDir = await this.ensureDir(join("submissions", submissionId, "workspace"));

    await Promise.all(
      files.map(async (file) => {
        const targetPath = join(workspaceDir, file.path);
        await mkdir(dirname(targetPath), { recursive: true });
        await writeFile(targetPath, file.content, "utf8");
      }),
    );

    return workspaceDir;
  }

  getSubmissionWorkspaceDir(submissionId: string) {
    return join(this.root, "submissions", submissionId, "workspace");
  }

  getReportDir(submissionId: string) {
    return join(this.root, "reports", submissionId);
  }

  getReportFilePath(submissionId: string, filename: string) {
    return join(this.getReportDir(submissionId), filename);
  }

  getArtifactUrl(submissionId: string, filename: string) {
    return `/api/artifacts/${submissionId}/${filename}`;
  }

  resolveArtifactPath(submissionId: string, filename: string) {
    const normalizedFilename = normalize(filename);

    if (normalizedFilename.includes("..")) {
      throw new Error("Invalid artifact path");
    }

    return this.getReportFilePath(submissionId, normalizedFilename);
  }
}
