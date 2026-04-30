"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import type { AuthUser } from "@yema/shared";
import { logout } from "../lib/api";

export function SessionControls({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.push("/");
      router.refresh();
    });
  }

  if (!user) {
    return (
      <a href="/auth" className="button">
        登录
      </a>
    );
  }

  return (
    <>
      <div className="session-chip">
        <strong>{user.name}</strong>
        <span>{user.email}</span>
      </div>
      <Link href="/submissions" className="button secondary">
        我的提交
      </Link>
      <button type="button" className="button secondary" onClick={handleLogout} disabled={isPending}>
        {isPending ? "退出中..." : "退出登录"}
      </button>
    </>
  );
}
