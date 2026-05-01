"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProblemSummary } from "@yema/shared";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  CircleDashed,
  Search,
} from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, getFavorites } from "@/lib/api";
import { cn } from "@/lib/utils";

const ALL_CATEGORY = "全部";
const EMPTY_FAVORITE_IDS: string[] = [];

const difficultyLabelMap = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
} as const;

const difficultyValueMap = {
  easy: 1,
  medium: 2,
  hard: 3,
} as const;

const difficultyColorMap = {
  easy: "text-green-600",
  medium: "text-amber-600",
  hard: "text-red-600",
} as const;

const DIFFICULTIES = [
  { label: "全部", value: "all" },
  { label: "简单", value: "easy" },
  { label: "中等", value: "medium" },
  { label: "困难", value: "hard" },
] as const;

const STATUS_FILTERS = [
  { label: "全部", value: "all" },
  { label: "已解决", value: "solved" },
  { label: "尝试中", value: "attempted" },
  { label: "未开始", value: "unstarted" },
] as const;

type ProblemListProps = {
  problems: ProblemSummary[];
  initialFavoriteIds?: string[];
  favoritesLoaded?: boolean;
  favoritesOnly?: boolean;
  emptyStateMessage?: string;
};

export function ProblemList({
  problems,
  initialFavoriteIds = EMPTY_FAVORITE_IDS,
  favoritesLoaded = false,
  favoritesOnly = false,
  emptyStateMessage = "暂无匹配的题目。",
}: ProblemListProps) {
  const [problemItems, setProblemItems] = useState(problems);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));
  const [isFavoriteStateReady, setIsFavoriteStateReady] = useState(favoritesLoaded);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultySort, setDifficultySort] = useState<"none" | "asc" | "desc">("none");

  useEffect(() => {
    setProblemItems(problems);
  }, [problems]);

  useEffect(() => {
    setFavoriteIds(new Set(initialFavoriteIds));
    setIsFavoriteStateReady(favoritesLoaded);
  }, [initialFavoriteIds, favoritesLoaded]);

  useEffect(() => {
    if (favoritesLoaded) {
      return;
    }

    let cancelled = false;

    async function loadFavorites() {
      try {
        const favorites = await getFavorites();

        if (!cancelled) {
          setFavoriteIds(new Set(favorites.map((problem) => problem.id)));
        }
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error("Failed to load favorites", error);
        }
      } finally {
        if (!cancelled) {
          setIsFavoriteStateReady(true);
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [favoritesLoaded]);

  const categories = useMemo(() => {
    const tags = Array.from(
      new Set(
        problemItems.flatMap((problem) =>
          (problem.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
        ),
      ),
    );

    return [ALL_CATEGORY, ...tags];
  }, [problemItems]);

  const processedProblems = useMemo(() => {
    let result = problemItems.filter((problem) => {
      const tags = problem.tags ?? [];
      const categoryMatch =
        selectedCategory === ALL_CATEGORY ||
        tags.some((tag) => tag.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

      const difficultyMatch =
        selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
      const statusMatch = selectedStatus === "all" || problem.status === selectedStatus;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const searchMatch =
        normalizedQuery.length === 0 ||
        problem.title.toLowerCase().includes(normalizedQuery) ||
        problem.shortDescription.toLowerCase().includes(normalizedQuery);

      return categoryMatch && difficultyMatch && statusMatch && searchMatch;
    });

    if (difficultySort !== "none") {
      result = [...result].sort((left, right) => {
        const leftValue = difficultyValueMap[left.difficulty];
        const rightValue = difficultyValueMap[right.difficulty];

        return difficultySort === "asc" ? leftValue - rightValue : rightValue - leftValue;
      });
    }

    return result;
  }, [
    difficultySort,
    problemItems,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedStatus,
  ]);

  function handleFavoriteChange(problemId: string, nextIsFavorite: boolean) {
    setFavoriteIds((current) => {
      const next = new Set(current);

      if (nextIsFavorite) {
        next.add(problemId);
      } else {
        next.delete(problemId);
      }

      return next;
    });

    if (favoritesOnly && !nextIsFavorite) {
      setProblemItems((current) => current.filter((problem) => problem.id !== problemId));
    }
  }

  function toggleDifficultySort() {
    setDifficultySort((current) => {
      if (current === "none") {
        return "asc";
      }

      if (current === "asc") {
        return "desc";
      }

      return "none";
    });
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-border pb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <span className="min-w-[48px] text-sm font-bold text-muted-foreground">分类</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                    selectedCategory === category
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-input bg-background text-muted-foreground hover:border-primary hover:text-primary",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索题目..."
              className="pl-9"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="min-w-[48px] text-sm font-bold text-muted-foreground">难度</span>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((difficulty) => (
              <button
                type="button"
                key={difficulty.value}
                onClick={() => setSelectedDifficulty(difficulty.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  selectedDifficulty === difficulty.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {difficulty.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="min-w-[48px] text-sm font-bold text-muted-foreground">状态</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                type="button"
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                  selectedStatus === status.value
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 text-center text-sm font-bold tracking-wider text-foreground uppercase">
                状态
              </TableHead>
              <TableHead className="text-left text-sm font-bold tracking-wider text-foreground uppercase">
                题目
              </TableHead>
              <TableHead
                className="w-32 text-center text-sm font-bold tracking-wider text-foreground uppercase"
                aria-sort={
                  difficultySort === "asc"
                    ? "ascending"
                    : difficultySort === "desc"
                      ? "descending"
                      : "none"
                }
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-1 px-2 py-1 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={toggleDifficultySort}
                  aria-label={
                    difficultySort === "asc"
                      ? "按难度排序，当前为升序"
                      : difficultySort === "desc"
                        ? "按难度排序，当前为降序"
                        : "按难度排序，当前未排序"
                  }
                >
                  <span>难度</span>
                  {difficultySort === "none" ? (
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                  ) : difficultySort === "asc" ? (
                    <ArrowUp className="h-3 w-3 text-primary" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-primary" />
                  )}
                </button>
              </TableHead>
              <TableHead className="w-48 text-center text-sm font-bold tracking-wider text-foreground uppercase">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  {emptyStateMessage}
                </TableCell>
              </TableRow>
            ) : (
              processedProblems.map((problem) => (
                <TableRow key={problem.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {problem.status === "solved" ? (
                        <div title="已解决">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                      ) : problem.status === "attempted" ? (
                        <div title="尝试中">
                          <CircleDashed className="h-5 w-5 animate-spin-slow text-blue-500" />
                        </div>
                      ) : (
                        <div title="未开始">
                          <Circle className="h-5 w-5 text-muted-foreground/30" />
                        </div>
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
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/problems/${problem.id}`}
                        className={buttonVariants({
                          variant: problem.status === "solved" ? "outline" : "default",
                          size: "sm",
                          className: "h-8 shrink-0 text-sm font-bold",
                        })}
                      >
                        {problem.status === "solved" ? "再次练习" : "作答"}
                      </Link>

                      <FavoriteButton
                        problemId={problem.id}
                        initialIsFavorite={favoriteIds.has(problem.id)}
                        ready={isFavoriteStateReady}
                        onChange={(nextIsFavorite) => handleFavoriteChange(problem.id, nextIsFavorite)}
                      />
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
