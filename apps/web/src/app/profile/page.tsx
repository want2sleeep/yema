import Link from "next/link";
import { Badge } from "../../components/ui/badge";
import { buttonVariants } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { getOptionalSessionUser } from "../../lib/auth";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "当前接口未提供";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-border py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="break-all text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="gap-3 p-8">
            <Badge variant="outline" className="w-fit">
              需要登录
            </Badge>
            <CardTitle className="text-2xl font-bold">登录后查看个人信息</CardTitle>
            <CardDescription className="text-base">
              这个页面只展示当前登录账号的基础资料。登录后会自动按原路径返回。
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-0">
            <Link href="/auth?mode=login&returnTo=/profile" className={buttonVariants({ className: "w-fit" })}>
              前往登录
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="gap-3 p-8">
          <Badge variant="outline" className="w-fit">
            个人信息
          </Badge>
          <CardTitle className="text-2xl font-bold">我的账号</CardTitle>
          <CardDescription className="text-base">
            展示当前登录用户的基础资料，不包含额外设置项。
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-0">
          <dl>
            <ProfileField label="姓名" value={user.name} />
            <ProfileField label="邮箱" value={user.email} />
            <ProfileField label="注册时间" value={user.createdAt ? formatDate(user.createdAt) : "当前接口未提供"} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
