import { SubmissionReportScreen } from "../../../../components/submission-report-screen";
import { Badge } from "../../../../components/ui/badge";
import { buttonVariants } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { getOptionalSessionUser } from "../../../../lib/auth";

export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="flex flex-col gap-4 p-8">
          <Badge variant="outline" className="w-fit">
            需要登录
          </Badge>
          <CardTitle className="text-2xl font-bold">登录后查看这份报告</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pb-8 pt-0">
          <p className="text-muted-foreground">提交报告仅对创建它的登录账号可见。</p>
          <a
            href={`/auth?mode=login&returnTo=/submissions/${id}/report`}
            className={buttonVariants({ className: "w-fit" })}
          >
            前往登录
          </a>
        </CardContent>
      </Card>
    );
  }

  return <SubmissionReportScreen submissionId={id} />;
}
