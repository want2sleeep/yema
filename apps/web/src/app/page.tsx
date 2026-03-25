import { ProblemList } from "../components/problem-list";
import { getProblems } from "../lib/api";

export default async function HomePage() {
  const problems = await getProblems();

  return <ProblemList problems={problems} />;
}

