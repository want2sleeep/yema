import { SubmissionReportScreen } from "../../../../components/submission-report-screen";

export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <SubmissionReportScreen submissionId={id} />;
}
