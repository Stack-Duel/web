import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

const TERMINAL_STATUSES =
  /Accepted|WrongAnswer|TimeLimitExceeded|MemoryLimitExceeded|RuntimeError|CompileError/;

export class ProblemsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(routerConfig.problems.path);
  }

  firstProblemRow() {
    return this.page.getByRole("table").getByRole("button").first();
  }

  async openFirstProblem() {
    await this.firstProblemRow().click();
  }

  async submitStarterCode() {
    await this.page.locator('[data-cy="run-btn"]:visible').click();
    await this.page
      .getByRole("button", { name: "Submission", exact: true })
      .click();

    await this.page.getByText(TERMINAL_STATUSES).first().waitFor({
      timeout: 60_000,
    });
  }
}
