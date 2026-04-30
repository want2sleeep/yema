"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTransition } from "react";
import type { AuthUser } from "@yema/shared";
import { logout } from "../lib/api";
import { getAvatarGradient, getAvatarInitial } from "../lib/avatar";

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
      <Link href="/submissions" className="button secondary">
        我的提交
      </Link>
      <div className="session-chip user-chip" data-email={user.email} title={user.email}>
        <div
          className="user-avatar"
          aria-hidden="true"
          style={{ backgroundImage: getAvatarGradient(user.name, user.email) }}
        >
          {getAvatarInitial(user.name, user.email)}
        </div>
        <strong className="user-name">{user.name}</strong>
      </div>
      <button type="button" className="button secondary" onClick={handleLogout} disabled={isPending}>
        {isPending ? "退出中..." : "退出登录"}
      </button>
    </>
  );
}
