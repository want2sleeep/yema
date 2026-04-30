"use client";

import { useState, useTransition } from "react";
import { ApiError, login, register } from "../lib/api";

type AuthMode = "login" | "register";

function formatAuthError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "邮箱或密码不正确。";
    }

    if (error.status === 409) {
      return "该邮箱已被注册。";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "认证失败，请稍后重试。";
}

export function AuthForm({ initialMode, returnTo }: { initialMode: AuthMode; returnTo: string }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        setError(null);

        if (mode === "login") {
          await login({
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
        } else {
          await register({
            name: String(formData.get("name") ?? ""),
            email: String(formData.get("email") ?? ""),
            password: String(formData.get("password") ?? ""),
          });
        }

        window.location.href = returnTo;
      } catch (submitError) {
        setError(formatAuthError(submitError));
      }
    });
  }

  return (
    <div className="auth-shell">
      <section className="auth-card panel">
        <div className="pill">账号</div>
        <h1>{mode === "login" ? "欢迎回来" : "创建页码账号"}</h1>
        <p className="muted">
          {mode === "login"
            ? "登录后即可提交代码并查看你的评测记录。"
            : "注册账号后可以保存提交记录、评测报告和练习进度。"}
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={`auth-toggle-button ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            登录
          </button>
          <button
            type="button"
            className={`auth-toggle-button ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            注册
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(new FormData(event.currentTarget));
          }}
        >
          {mode === "register" ? (
            <label className="field">
              <span>昵称</span>
              <input className="input" name="name" type="text" minLength={2} required />
            </label>
          ) : null}
          <label className="field">
            <span>邮箱</span>
            <input className="input" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="field">
            <span>密码</span>
            <input
              className="input"
              name="password"
              type="password"
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" className="button" disabled={isPending}>
            {mode === "login" ? (isPending ? "登录中..." : "登录") : isPending ? "注册中..." : "创建账号"}
          </button>
        </form>
      </section>
    </div>
  );
}
