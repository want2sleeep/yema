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
          {problems.map((problem) => (
            <TableRow key={problem.id} className="transition-colors hover:bg-muted/50">
              <TableCell className="text-center">
                <span className="text-muted-foreground">—</span>
              </TableCell>
              <TableCell className="text-left">
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/problems/${problem.id}`}
                    className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {problem.title}
                  </Link>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
