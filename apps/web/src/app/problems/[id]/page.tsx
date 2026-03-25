import { CodeWorkspace } from "../../../components/code-workspace";
import { getProblem } from "../../../lib/api";

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const problem = await getProblem(id);

  return <CodeWorkspace problem={problem} />;
}

