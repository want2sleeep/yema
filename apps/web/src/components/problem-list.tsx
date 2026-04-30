import Link from "next/link";
import { ProblemSummary } from "@yema/shared";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

export function ProblemList({ problems }: { problems: ProblemSummary[] }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-20 text-center font-semibold">状态</TableHead>
            <TableHead className="font-semibold text-left">题目</TableHead>
            <TableHead className="w-32 text-center font-semibold">难度</TableHead>
            <TableHead className="w-32 text-center font-semibold">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {problems.map((problem) => (
            <TableRow key={problem.id} className="transition-colors hover:bg-muted/50">
              <TableCell className="text-center">
                <span className="text-muted-foreground">—</span>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex flex-col gap-1">
                  <Link href={`/problems/${problem.id}`} className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                    {problem.title}
                  </Link>
                  <span className="text-[12px] text-muted-foreground line-clamp-1">
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
                <Button asChild variant="outline" size="sm" className="h-8 text-xs font-bold">
                  <Link href={`/problems/${problem.id}`}>
                    开始作答
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
