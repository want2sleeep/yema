import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Frontend OJ + LLM",
  description: "Graduation project MVP for an LLM-powered frontend online judge",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="page-header">
            <div>
              <div className="pill">Graduation Project MVP</div>
              <h1>LLM-Powered Frontend Online Judge</h1>
              <p className="muted">For frontend assignments with structured scoring, render analysis and teaching feedback.</p>
            </div>
            <Link href="/" className="button secondary">
              Back to Problems
            </Link>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
