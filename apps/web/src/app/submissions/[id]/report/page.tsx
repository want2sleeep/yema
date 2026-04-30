import { SubmissionReportScreen } from "../../../../components/submission-report-screen";
import { getOptionalSessionUser } from "../../../../lib/auth";

export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <section className="panel report-card empty-state">
        <div className="pill">需要登录</div>
        <h2>登录后查看这份报告</h2>
        <p className="muted">提交报告仅对创建它的登录账号可见。</p>
        <a href={`/auth?mode=login&returnTo=/submissions/${id}/report`} className="button">
          前往登录
        </a>
      </section>
    );
  }

  return <SubmissionReportScreen submissionId={id} />;
}
