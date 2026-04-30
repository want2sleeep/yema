"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { AuthUser } from "@yema/shared";
import { logout } from "../lib/api";
import { getAvatarUrl } from "../lib/avatar";
import { cn } from "../lib/utils";

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
      <a 
        href="/auth" 
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
      >
        登录
      </a>
    );
  }

  return (
    <div className="group relative inline-block">
      <div className="flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-sm transition-all hover:scale-105 hover:shadow-md">
        <img
          src={getAvatarUrl(user.email, "bottts-neutral")}
          alt={user.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="invisible absolute right-0 top-full z-50 mt-3 w-60 translate-y-2 rounded-xl border border-border bg-card p-4 text-left shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="absolute -top-3 left-0 right-0 h-3" />
        <div className="mb-3 border-b border-border pb-3">
          <span className="block text-base font-bold text-foreground">{user.name}</span>
          <span className="block break-all text-sm text-muted-foreground">{user.email}</span>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background p-2.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/20 active:scale-95 disabled:opacity-50"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}
