"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Problem, SubmissionFile } from "@yema/shared";
import { createSubmission } from "../lib/api";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export function CodeWorkspace({ problem }: { problem: Problem }) {
  const router = useRouter();
  const initialFiles = useMemo<SubmissionFile[]>(
    () => problem.templateFiles.map((file) => ({ path: file.path, content: file.content })),
    [problem.templateFiles],
  );
  const [files, setFiles] = useState<SubmissionFile[]>(initialFiles);
  const [activePath, setActivePath] = useState<string>(initialFiles[0]?.path ?? "");
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
    startTransition(async () => {
      const result = await createSubmission({
        problemId: problem.id,
        userId: "demo-student",
        files,
      });

      router.push(`/submissions/${result.submissionId}/report`);
    });
  }

  return (
    <section className="workspace">
      <aside className="panel sidebar">
        <div className="pill">题目</div>
        <h2>{problem.title}</h2>
        <p className="muted">{problem.description}</p>
        <h3>评分权重</h3>
        <ul>
          <li>功能正确性：{problem.config.weights.correctness}</li>
          <li>代码质量：{problem.config.weights.codeQuality}</li>
          <li>页面渲染：{problem.config.weights.uiRendering}</li>
          <li>工程规范：{problem.config.weights.engineering}</li>
        </ul>
        <h3>必需选择器</h3>
        <ul>
          {problem.config.requiredSelectors.map((selector) => (
            <li key={selector}>{selector}</li>
          ))}
        </ul>
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
