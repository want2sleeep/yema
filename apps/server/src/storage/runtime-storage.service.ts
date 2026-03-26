import { Injectable } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { SubmissionFile } from "@yema/shared";

@Injectable()
export class RuntimeStorageService {
  private readonly root = resolve(join(process.cwd(), "runtime"));

  async ensureDir(pathSegment: string) {
    const normalizedSegment = this.normalizeRelativeDirPath(pathSegment);
    const fullPath = resolve(this.root, normalizedSegment);

    if (!this.isWithinBaseDir(fullPath, this.root)) {
      throw new Error("Invalid runtime directory path");
    }

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
    const safeSubmissionId = this.normalizeSubmissionId(submissionId);
    const workspaceDir = await this.ensureSubmissionWorkspaceDir(safeSubmissionId);
    const resolvedWorkspaceDir = resolve(workspaceDir);

    await Promise.all(
      files.map(async (file) => {
        const safeRelativePath = this.normalizeRelativeFilePath(file.path);
        const targetPath = resolve(resolvedWorkspaceDir, safeRelativePath);

        if (!this.isWithinBaseDir(targetPath, resolvedWorkspaceDir)) {
          throw new Error("Invalid submission file path");
        }

        await mkdir(dirname(targetPath), { recursive: true });
        await writeFile(targetPath, file.content, "utf8");
      }),
    );

    return workspaceDir;
  }

  async ensureSubmissionWorkspaceDir(submissionId: string) {
    return this.ensureDir(join("submissions", this.normalizeSubmissionId(submissionId), "workspace"));
  }

  async ensureReportDir(submissionId: string) {
    return this.ensureDir(join("reports", this.normalizeSubmissionId(submissionId)));
  }

  getSubmissionWorkspaceDir(submissionId: string) {
    return join(this.root, "submissions", this.normalizeSubmissionId(submissionId), "workspace");
  }

  getReportDir(submissionId: string) {
    return join(this.root, "reports", this.normalizeSubmissionId(submissionId));
  }

  getReportFilePath(submissionId: string, filename: string) {
    return join(this.getReportDir(submissionId), filename);
  }

  getArtifactUrl(submissionId: string, filename: string) {
    const safeSubmissionId = this.normalizeSubmissionId(submissionId);
    const safeFilename = this.normalizeRelativeFilePath(filename);
    const segments = safeFilename.split("/").map((segment) => encodeURIComponent(segment));
    return `/api/artifacts/${encodeURIComponent(safeSubmissionId)}/${segments.join("/")}`;
  }

  resolveArtifactPath(submissionId: string, filename: string) {
    const safeSubmissionId = this.normalizeSubmissionId(submissionId);
    const reportDir = resolve(this.getReportDir(safeSubmissionId));
    const normalizedFilename = this.normalizeRelativeFilePath(filename);
    const targetPath = resolve(reportDir, normalizedFilename);

    if (!this.isWithinBaseDir(targetPath, reportDir)) {
      throw new Error("Invalid artifact path");
    }

    return targetPath;
  }

  private normalizeSubmissionId(submissionId: string) {
    if (!/^[A-Za-z0-9-]+$/.test(submissionId)) {
      throw new Error("Invalid submission identifier");
    }

    return submissionId;
  }

  private normalizeRelativeFilePath(inputPath: string) {
    const normalizedPath = normalize(inputPath).replace(/\\/g, "/");

    if (!normalizedPath || normalizedPath === "." || isAbsolute(normalizedPath)) {
      throw new Error("Invalid relative path");
    }

    if (normalizedPath.split("/").some((segment) => segment === ".." || segment === "")) {
      throw new Error("Invalid relative path");
    }

    return normalizedPath;
  }

  private normalizeRelativeDirPath(pathSegment: string) {
    const normalizedPath = normalize(pathSegment).replace(/\\/g, "/");

    if (!normalizedPath || normalizedPath === "." || isAbsolute(normalizedPath)) {
      throw new Error("Invalid relative directory path");
    }

    if (normalizedPath.split("/").some((segment) => segment === ".." || segment === "")) {
      throw new Error("Invalid relative directory path");
    }

    return normalizedPath;
  }

  private isWithinBaseDir(targetPath: string, baseDir: string) {
    return targetPath === baseDir || targetPath.startsWith(`${baseDir}${sep}`);
  }
}
