"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@yema/shared";
import { SessionControls } from "./session-controls";
import { SidebarNavigation } from "./sidebar-navigation";
import { cn } from "@/lib/utils";

function getSectionLabel(pathname: string) {
  if (pathname.startsWith("/submissions")) {
    return "我的提交";
  }

  if (pathname.startsWith("/favorites")) {
    return "我的收藏";
  }

  if (pathname.startsWith("/profile")) {
    return "个人信息";
  }

  if (pathname.startsWith("/auth")) {
    return "账号";
  }

  return "题目列表";
}

function AppHeader({
  user,
  sectionLabel,
  showMenuButton,
  onOpenMenu,
}: {
  user: AuthUser | null;
  sectionLabel: string;
  showMenuButton: boolean;
  onOpenMenu?: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5">
        {showMenuButton ? (
          <button
            type="button"
            aria-label="打开导航菜单"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={onOpenMenu}
          >
            <Menu className="size-4" />
          </button>
        ) : null}

        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <Image
            src="/branding/yema-logo-only-icon.svg"
            alt="Yema logo"
            width={32}
            height={32}
            className="h-8 w-8 transition-transform group-hover:scale-105"
            priority
          />
          <span className="text-xl font-black tracking-tighter text-primary">
            页码 <span className="text-foreground/80">OJ</span>
          </span>
        </Link>

        <div className="hidden h-4 w-px bg-border md:block" />
        <p className="hidden whitespace-nowrap text-sm text-muted-foreground lg:block">
          面向前端练习场景的智能评测系统
        </p>
        <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground md:inline-flex lg:hidden">
          {sectionLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground xl:inline">{sectionLabel}</span>
        <SessionControls user={user} />
      </div>
    </header>
  );
}

function SidebarRail({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm">
      <div className="border-b border-sidebar-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          切换题库、提交记录和即将接入的个人能力入口。
        </p>
      </div>
      <SidebarNavigation pathname={pathname} onNavigate={onNavigate} className="px-3 py-3" />
    </div>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isAuthRoute = pathname.startsWith("/auth");
  const sectionLabel = getSectionLabel(pathname);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileNavOpen]);

  if (isAuthRoute) {
    return (
      <div className="app-shell">
        <AppHeader user={user} sectionLabel={sectionLabel} showMenuButton={false} />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader
        user={user}
        sectionLabel={sectionLabel}
        showMenuButton
        onOpenMenu={() => setIsMobileNavOpen(true)}
      />

      <div className="mt-6 flex flex-1 gap-6 lg:gap-8">
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-6">
            <SidebarRail pathname={pathname} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <div
        aria-hidden={!isMobileNavOpen}
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isMobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="关闭导航菜单"
          className={cn(
            "absolute inset-0 bg-foreground/30 transition-opacity",
            isMobileNavOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setIsMobileNavOpen(false)}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-label="主导航"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform",
            isMobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
            <span className="text-sm font-semibold text-foreground">导航</span>
            <button
              type="button"
              aria-label="关闭导航菜单"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-sidebar-border bg-background text-foreground transition-colors hover:bg-muted"
              onClick={() => setIsMobileNavOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            <SidebarRail pathname={pathname} onNavigate={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
