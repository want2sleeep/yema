import { CodeWorkspace } from "../../../components/code-workspace";
import { getOptionalSessionUser } from "../../../lib/auth";
import { getProblem } from "../../../lib/api";

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [problem, currentUser] = await Promise.all([getProblem(id), getOptionalSessionUser()]);

  return <CodeWorkspace problem={problem} currentUser={currentUser} />;
}
