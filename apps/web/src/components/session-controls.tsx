"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { AuthUser } from "@yema/shared";
import { logout } from "../lib/api";
import { getAvatarSeed, getAvatarUrl } from "../lib/avatar";

export function SessionControls({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const avatarSeed = user ? getAvatarSeed(user.email) : "";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    startTransition(async () => {
      await logout();
      setIsMenuOpen(false);
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
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-label="打开账户菜单"
        className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-sm transition-all hover:scale-105 hover:shadow-md focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        onClick={() => setIsMenuOpen((value) => !value)}
      >
        <img
          src={getAvatarUrl(avatarSeed, "bottts-neutral")}
          alt={user.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </button>

      <div
        id={menuId}
        role="menu"
        aria-hidden={!isMenuOpen}
        className={`absolute right-0 top-full z-50 mt-3 w-60 rounded-xl border border-border bg-card p-4 text-left shadow-lg transition-all duration-200 ${
          isMenuOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-2 opacity-0"
        }`}
      >
        <div className="mb-3 border-b border-border pb-3">
          <span className="block text-base font-bold text-foreground">{user.name}</span>
          <span className="block break-all text-sm text-muted-foreground">{user.email}</span>
        </div>
        <button
          type="button"
          role="menuitem"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background p-2.5 text-sm font-bold text-destructive transition-all hover:border-destructive/20 hover:bg-destructive/10 active:scale-95 disabled:opacity-50"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}
