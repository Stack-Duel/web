import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

export class StudioProblemsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto(routerConfig.studioProblems.path);
  }

  get searchInput() {
    return this.page.getByPlaceholder("Search by title, slug, or ID...");
  }

  get newProblemLink() {
    return this.page.getByRole("link", { name: /new problem/i });
  }

  get openLimitBadge() {
    return this.page.getByText(/^\d+\/10 open$/);
  }

  statusPill(name: string) {
    return this.page.getByRole("button", { name: new RegExp(`^${name}`, "i") });
  }
}
