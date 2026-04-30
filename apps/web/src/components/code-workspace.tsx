"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AuthUser, Problem, SubmissionFile } from "@yema/shared";
import { ApiError, createSubmission } from "../lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const dimensionLabelMap = {
  correctness: "功能完成度",
  codeQuality: "代码质量",
  uiRendering: "页面渲染",
  engineering: "工程规范",
} as const;

function formatSubmitError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    return "请先登录后再提交。";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "提交失败，请稍后重试。";
}

export function CodeWorkspace({ problem, currentUser }: { problem: Problem; currentUser: AuthUser | null }) {
  const router = useRouter();
  const initialFiles = useMemo<SubmissionFile[]>(
    () => problem.templateFiles.map((file) => ({ path: file.path, content: file.content })),
    [problem.templateFiles],
  );
  const [files, setFiles] = useState<SubmissionFile[]>(initialFiles);
  const [activePath, setActivePath] = useState<string>(initialFiles[0]?.path ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeFile = files.find((file) => file.path === activePath) ?? files[0];

  function updateFileContent(content: string | undefined) {
    if (!activeFile) {
      return;
    }

    setFiles((current) =>
      current.map((file) => (file.path === activeFile.path ? { ...file, content: content ?? "" } : file)),
    );
  }

  function handleSubmit() {
    if (!currentUser) {
      window.location.href = `/auth?mode=login&returnTo=/problems/${problem.id}`;
      return;
    }

    startTransition(async () => {
      try {
        setSubmitError(null);
        const result = await createSubmission({
          problemId: problem.id,
          files,
        });

        router.push(`/submissions/${result.submissionId}/report`);
      } catch (error) {
        setSubmitError(formatSubmitError(error));
      }
    });
  }

  return (
    <section className="workspace">
      <aside className="panel sidebar">
        <div className="pill">题目</div>
        <h2>{problem.title}</h2>
        <p className="muted">{problem.description}</p>

        <h3>完成要求</h3>
        <ul>
          {problem.config.requirements.map((item, index) => (
            <li key={`${index}-${item}`}>{item}</li>
          ))}
        </ul>

        <h3>评分权重</h3>
        <ul>
          <li>功能完成度：{problem.config.weights.correctness}</li>
          <li>代码质量：{problem.config.weights.codeQuality}</li>
          <li>页面渲染：{problem.config.weights.uiRendering}</li>
          <li>工程规范：{problem.config.weights.engineering}</li>
        </ul>

        <h3>关键规则</h3>
        <ul>
          {problem.config.evaluationRules.slice(0, 5).map((rule) => (
            <li key={rule.id}>
              {rule.title} ({dimensionLabelMap[rule.dimension]})
            </li>
          ))}
        </ul>

        <p className="muted">
          评测视口：{problem.config.renderConfig.viewportWidth} x {problem.config.renderConfig.viewportHeight}
        </p>

        {currentUser ? (
          <p className="muted">当前登录：{currentUser.name}</p>
        ) : (
          <div className="notice-banner">
            <strong>需要先登录</strong>
            <p className="muted">登录后才可以提交本题，并保存你的评测记录。</p>
          </div>
        )}

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <button type="button" className="button" onClick={handleSubmit} disabled={isPending}>
          {isPending ? "提交中..." : "提交评测"}
        </button>
      </aside>

      <div className="panel editor-wrap">
        <div className="editor-tabs">
          {files.map((file) => (
            <button
              key={file.path}
              type="button"
              className={`editor-tab ${file.path === activePath ? "active" : ""}`}
              onClick={() => setActivePath(file.path)}
            >
              {file.path}
            </button>
          ))}
        </div>
        {activeFile ? (
          <MonacoEditor
            height="70vh"
            theme="vs-light"
            defaultLanguage={activeFile.path.endsWith(".css") ? "css" : "html"}
            language={activeFile.path.endsWith(".css") ? "css" : "html"}
            value={activeFile.content}
            onChange={updateFileContent}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        ) : null}
      </div>
    </section>
  );
}
