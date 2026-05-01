"use client";

import { useEffect, useState, useTransition } from "react";
import { Star } from "lucide-react";
import { addFavorite, ApiError, removeFavorite } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  problemId: string;
  initialIsFavorite: boolean;
  ready: boolean;
  onChange?: (nextIsFavorite: boolean) => void;
  className?: string;
};

function formatFavoriteError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "收藏失败，请稍后重试。";
}

export function FavoriteButton({
  problemId,
  initialIsFavorite,
  ready,
  onChange,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  function handleClick() {
    if (!ready || isPending) {
      return;
    }

    startTransition(async () => {
      const nextIsFavorite = !isFavorite;

      setErrorMessage(null);
      setIsFavorite(nextIsFavorite);

      try {
        if (nextIsFavorite) {
          await addFavorite(problemId);
        } else {
          await removeFavorite(problemId);
        }

        onChange?.(nextIsFavorite);
      } catch (error) {
        setIsFavorite(!nextIsFavorite);

        if (error instanceof ApiError && error.status === 401) {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/auth?mode=login&returnTo=${encodeURIComponent(returnTo)}`;
          return;
        }

        setErrorMessage(formatFavoriteError(error));
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isFavorite ? "取消收藏题目" : "收藏题目"}
        aria-pressed={isFavorite}
        aria-busy={!ready || isPending}
        title={errorMessage ?? (isFavorite ? "取消收藏" : "收藏")}
        className={cn(
          "rounded-full border border-transparent transition-colors",
          !ready && "opacity-60",
          isFavorite
            ? "text-amber-500 hover:bg-amber-50 hover:text-amber-600"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          className,
        )}
        disabled={!ready || isPending}
        onClick={handleClick}
      >
        <Star className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </Button>
      <span className="sr-only" aria-live="polite">
        {errorMessage ?? (isFavorite ? "已收藏" : "未收藏")}
      </span>
    </>
  );
}
