import Link from "next/link";
import { ProblemSummary } from "@yema/shared";

export function ProblemList({ problems }: { problems: ProblemSummary[] }) {
  return (
    <section className="grid problem-grid">
      {problems.map((problem) => (
        <article className="panel problem-card" key={problem.id}>
          <div className="pill">{problem.difficulty}</div>
          <h3>{problem.title}</h3>
          <p className="muted">{problem.shortDescription}</p>
          <Link href={`/problems/${problem.id}`} className="button">
            开始作答
          </Link>
        </article>
      ))}
    </section>
  );
}
