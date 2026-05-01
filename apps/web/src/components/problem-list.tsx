"use client";

import { useState } from "react";
import Link from "next/link";
import { ProblemSummary } from "@yema/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CircleDashed, Star } from "lucide-react";

const difficultyLabelMap = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
} as const;

const difficultyColorMap = {
  easy: "text-green-600",
  medium: "text-amber-600",
  hard: "text-red-600",
} as const;

const CATEGORIES = ["全部", "HTML", "CSS", "JavaScript", "React", "Vue", "Performance"];
const DIFFICULTIES = [
  { label: "全部", value: "all" },
  { label: "简单", value: "easy" },
  { label: "中等", value: "medium" },
  { label: "困难", value: "hard" },
];
const STATUS_FILTERS = [
  { label: "全部", value: "all" },
  { label: "已解决", value: "solved" },
  { label: "尝试中", value: "attempted" },
  { label: "未开始", value: "unstarted" },
];

export function ProblemList({ problems }: { problems: ProblemSummary[] }) {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredProblems = problems.filter((p) => {
    const pTags = p.tags || [];
    const categoryMatch =
      selectedCategory === "全部" ||
      pTags.some((tag) => tag.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

    const difficultyMatch = selectedDifficulty === "all" || p.difficulty === selectedDifficulty;
    const statusMatch = selectedStatus === "all" || p.status === selectedStatus;

    return categoryMatch && difficultyMatch && statusMatch;
  });

  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      {/* 筛选区域 */}
      <div className="flex flex-col gap-5 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="min-w-[48px] text-sm font-bold text-muted-foreground">分类</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all rounded-full border",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-input"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="min-w-[48px] text-sm font-bold text-muted-foreground">难度</span>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all rounded-full border",
                  selectedDifficulty === diff.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-input"
                )}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="min-w-[48px] text-sm font-bold text-muted-foreground">状态</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium transition-all rounded-full border",
                  selectedStatus === status.value
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-input"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 题目列表表格 */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 text-center font-bold text-sm text-foreground uppercase tracking-wider">状态</TableHead>
              <TableHead className="text-left font-bold text-sm text-foreground uppercase tracking-wider">题目</TableHead>
              <TableHead className="w-32 text-center font-bold text-sm text-foreground uppercase tracking-wider">难度</TableHead>
              <TableHead className="w-40 text-center font-bold text-sm text-foreground uppercase tracking-wider">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  暂无匹配的题目
                </TableCell>
              </TableRow>
            ) : (
              filteredProblems.map((problem) => (
                <TableRow key={problem.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {problem.status === "solved" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" title="已解决" />
                      ) : problem.status === "attempted" ? (
                        <CircleDashed className="h-5 w-5 text-blue-500 animate-spin-slow" title="尝试中" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/30" title="未开始" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex flex-col gap-1 py-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/problems/${problem.id}`}
                          className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                        >
                          {problem.title}
                        </Link>
                        <div className="flex gap-1">
                          {(problem.tags ?? []).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="h-4 px-1.5 text-[11px] font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <span className="line-clamp-1 text-sm text-muted-foreground">
                        {problem.shortDescription}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm font-bold">
                    <span className={cn(difficultyColorMap[problem.difficulty])}>
                      {difficultyLabelMap[problem.difficulty]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3 px-2">
                      <Link
                        href={`/problems/${problem.id}`}
                        className={buttonVariants({
                          variant: problem.status === "solved" ? "outline" : "default",
                          size: "sm",
                          className: "h-8 text-sm font-bold flex-1",
                        })}
                      >
                        {problem.status === "solved" ? "再次练习" : "开始作答"}
                      </Link>
                      <button
                        onClick={() => toggleFavorite(problem.id)}
                        className="group flex h-8 w-8 items-center justify-center rounded-full transition-all hover:bg-muted"
                        title={favorites.has(problem.id) ? "取消收藏" : "收藏题目"}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5 transition-all",
                            favorites.has(problem.id)
                              ? "fill-yellow-400 text-yellow-400 scale-110"
                              : "text-muted-foreground group-hover:text-yellow-500"
                          )}
                        />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
