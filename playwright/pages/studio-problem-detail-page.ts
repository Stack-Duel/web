import type { Page } from "@playwright/test";
import { routerConfig } from "@/shared/router-config";

export class StudioProblemDetailPage {
  constructor(private readonly page: Page) {}

  async goto(id: string) {
    await this.page.goto(routerConfig.studioProblemDetail.execute({ id }));
  }

  get questionTab() {
    return this.page.getByRole("tab", { name: "Question" });
  }

  get setupsTab() {
    return this.page.getByRole("tab", { name: "Setups" });
  }
}
