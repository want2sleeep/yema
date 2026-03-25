import { Injectable } from "@nestjs/common";
import { EvidenceItem, Problem, StaticAnalysisResult, SubmissionFile } from "@yema/shared";

@Injectable()
export class StaticAnalysisService {
  analyze(problem: Problem, files: SubmissionFile[]): StaticAnalysisResult {
    const htmlFile = files.find((file) => file.path.endsWith(".html"));
    const cssFile = files.find((file) => file.path.endsWith(".css"));
    const evidence: EvidenceItem[] = [];
    const htmlContent = htmlFile?.content ?? "";
    const cssContent = cssFile?.content ?? "";
    const matchedSelectors = problem.config.requiredSelectors.filter((selector) =>
      this.containsSelector(htmlContent, selector),
    );
    const missingTexts = problem.config.requiredTexts.filter((text) => !htmlContent.includes(text));

    if (missingTexts.length > 0) {
      evidence.push({
        id: "static-missing-text",
        category: "static",
        title: "Missing required text",
        detail: `The following text was not found in HTML: ${missingTexts.join(", ")}`,
        severity: "warning",
        scoreImpact: -8,
      });
    } else {
      evidence.push({
        id: "static-text-ok",
        category: "static",
        title: "Required text matched",
        detail: "All required phrases are present in the HTML template.",
        severity: "info",
        scoreImpact: 4,
      });
    }

    if (!cssContent.includes("display")) {
      evidence.push({
        id: "static-style-weak",
        category: "static",
        title: "Weak layout styling",
        detail: "No common layout declaration was found in CSS, so the page may still look unfinished.",
        severity: "warning",
        scoreImpact: -6,
      });
    }

    return {
      syntaxOk: Boolean(htmlFile && cssFile),
      lintWarnings: evidence.filter((item) => item.severity === "warning").length,
      lintErrors: evidence.filter((item) => item.severity === "error").length,
      matchedSelectors,
      evidence,
    };
  }

  private containsSelector(html: string, selector: string) {
    if (selector.startsWith("#")) {
      return html.includes(`id="${selector.slice(1)}"`);
    }

    if (selector.startsWith(".")) {
      return html.includes(`class="${selector.slice(1)}`) || html.includes(` ${selector.slice(1)}`);
    }

    return html.includes(`<${selector}`);
  }
}
