import { SubmissionOverview } from "../../components/submission-overview";
import { Badge } from "../../components/ui/badge";
import { buttonVariants } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getCookieHeader, getOptionalSessionUser } from "../../lib/auth";
import { getSubmissions } from "../../lib/api";

export default async function SubmissionsPage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="flex flex-col gap-4 p-8">
          <Badge variant="outline" className="w-fit">
            需要登录
          </Badge>
          <CardTitle className="text-2xl font-bold">登录后查看你的提交记录</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pb-8 pt-0">
          <p className="text-muted-foreground">
            评测记录会按账号保存，所以这个页面仅对已登录用户开放。
          </p>
          <a href="/auth?mode=login&returnTo=/submissions" className={buttonVariants({ className: "w-fit" })}>
            前往登录
          </a>
        </CardContent>
      </Card>
    );
  }

  const submissions = await getSubmissions(await getCookieHeader());

  return <SubmissionOverview submissions={submissions} />;
}
