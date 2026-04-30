import { SubmissionOverview } from "../../components/submission-overview";
import { getCookieHeader, getOptionalSessionUser } from "../../lib/auth";
import { getSubmissions } from "../../lib/api";

export default async function SubmissionsPage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <section className="panel report-card empty-state mx-auto max-w-2xl">
        <div className="pill pill-info">需要登录</div>
        <h2 className="text-2xl font-bold">登录后查看你的提交记录</h2>
        <p className="text-muted-foreground">评测记录会按账号保存，所以这个页面仅对已登录用户开放。</p>
        <a href="/auth?mode=login&returnTo=/submissions" className="button mt-4">
          前往登录
        </a>
      </section>
    );
  }

  const submissions = await getSubmissions(await getCookieHeader());

  return <SubmissionOverview submissions={submissions} />;
}
