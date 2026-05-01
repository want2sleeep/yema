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

const CATEGORIES = ["全部", "HTML", "CSS", "JavaScript", "React", "Vue"];

export function ProblemList({ problems }: { problems: ProblemSummary[] }) {
  const [selectedCategory, setSelectedCategory] = useState("全部");

  const filteredProblems =
    selectedCategory === "全部"
      ? problems
      : problems.filter((p) => (p.tags ?? []).some((tag) => tag.toLowerCase() === selectedCategory.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm font-medium text-muted-foreground">分类:</span>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-3 py-1 text-sm font-medium transition-all rounded-full border",
              selectedCategory === category
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border-input"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 text-center font-semibold">状态</TableHead>
              <TableHead className="text-left font-semibold">题目</TableHead>
              <TableHead className="w-32 text-center font-semibold">难度</TableHead>
              <TableHead className="w-32 text-center font-semibold">操作</TableHead>
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
                    <span className="text-muted-foreground">—</span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex flex-col gap-1.5 py-1">
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
                              className="h-4 px-1.5 text-[10px] font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <span className="line-clamp-1 text-[12px] text-muted-foreground">
                        {problem.shortDescription}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold uppercase tracking-wider">
                    <span className={difficultyColorMap[problem.difficulty]}>
                      {difficultyLabelMap[problem.difficulty]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/problems/${problem.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "h-8 text-xs font-bold",
                      })}
                    >
                      开始作答
                    </Link>
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
