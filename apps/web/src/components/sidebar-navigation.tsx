"use client";

import { FileText, Heart, List, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: "/" | "/submissions" | "/favorites" | "/profile";
  label: string;
  description: string;
  icon: LucideIcon;
  match: "exact" | "prefix";
};

const primaryItems: NavItem[] = [
  {
    href: "/",
    label: "题目列表",
    description: "浏览并开始前端练习题。",
    icon: List,
    match: "exact",
  },
  {
    href: "/submissions",
    label: "我的提交",
    description: "查看提交记录与评测报告。",
    icon: FileText,
    match: "prefix",
  },
];

const secondaryItems: NavItem[] = [
  {
    href: "/favorites",
    label: "我的收藏",
    description: "预留给收藏题目的内容入口。",
    icon: Heart,
    match: "prefix",
  },
  {
    href: "/profile",
    label: "个人信息",
    description: "预留给账号资料与偏好的入口。",
    icon: UserRound,
    match: "prefix",
  },
];

function isItemActive(pathname: string, item: NavItem) {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavigationSection({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => {
        const active = isItemActive(pathname, item);
        const Icon = item.icon;

        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-3 py-3 transition-all",
              active
                ? "border-border bg-background text-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:border-sidebar-border hover:bg-background/80 hover:text-foreground",
            )}
            onClick={onNavigate}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                active
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-sidebar-border bg-background text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {item.description}
              </span>
            </span>
          </a>
        );
      })}
    </div>
  );
}

export function SidebarNavigation({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <section className="space-y-3">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Explore
        </p>
        <NavigationSection items={primaryItems} pathname={pathname} onNavigate={onNavigate} />
      </section>

      <section className="space-y-3 border-t border-sidebar-border pt-5">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Account
        </p>
        <NavigationSection items={secondaryItems} pathname={pathname} onNavigate={onNavigate} />
      </section>
    </div>
  );
}
