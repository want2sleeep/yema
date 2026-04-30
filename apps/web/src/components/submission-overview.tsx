import Link from "next/link";
import { SubmissionSummary } from "@yema/shared";
import { formatSubmissionStatus } from "../lib/submission-status";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SubmissionOverview({ submissions }: { submissions: SubmissionSummary[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="p-8 text-left">
          <Badge variant="outline" className="mb-3 w-fit border-blue-200 bg-blue-50 text-blue-700">提交历史</Badge>
          <CardTitle className="text-2xl font-bold">评测总览</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            查看你最近的评测记录、分数以及详细改进建议。
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h3 className="text-lg font-semibold text-muted-foreground">还没有提交记录</h3>
            <p className="mb-4 text-sm text-muted-foreground">去题目列表尝试完成一次挑战吧！</p>
            <Button asChild>
              <Link href="/">
                去做题
              </Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-40 text-center font-semibold">状态</TableHead>
                <TableHead className="text-left font-semibold">题目</TableHead>
                <TableHead className="w-48 text-center font-semibold">提交时间</TableHead>
                <TableHead className="w-28 text-center font-semibold">分数</TableHead>
                <TableHead className="w-32 text-center font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center rounded-full px-3 py-1 text-[13px] font-bold",
                      submission.status === "completed" ? "bg-green-100/50 text-green-700" :
                      submission.status === "running" ? "bg-blue-100/50 text-blue-700" :
                      submission.status === "failed" ? "bg-red-100/50 text-red-700" :
                      "bg-amber-100/50 text-amber-700"
                    )}>
                      {formatSubmissionStatus(submission.status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <Link href={`/problems/${submission.problemId}`} className="font-bold text-foreground hover:text-primary transition-colors text-sm">
                      {submission.problemTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatDate(submission.createdAt)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "text-base font-bold",
                      typeof submission.totalScore === "number" ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {typeof submission.totalScore === "number" ? `${submission.totalScore}` : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button asChild variant="secondary" size="sm" className="font-bold">
                      <Link href={`/submissions/${submission.id}/report`}>
                        查看报告
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
