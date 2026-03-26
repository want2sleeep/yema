import { SubmissionOverview } from "../../components/submission-overview";
import { getSubmissions } from "../../lib/api";

export default async function SubmissionsPage() {
  const submissions = await getSubmissions();

  return <SubmissionOverview submissions={submissions} />;
}
