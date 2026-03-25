import { ReportView } from "../../../../components/report-view";
import { getReport, getSubmission } from "../../../../lib/api";

export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [submission, report] = await Promise.all([getSubmission(id), getReport(id)]);

  return <ReportView submission={submission} report={report} />;
}
