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

  get titleLink() {
    return this.page.getByRole("link", { name: "Two Sum" });
  }

  get deleteButton() {
    return this.page.getByRole("button", { name: "Delete" });
  }

  get confirmationInput() {
    return this.page.getByLabel(/to confirm/i);
  }

  get confirmDeleteButton() {
    return this.page.getByRole("button", { name: "Delete problem" });
  }

  get publishChangesButton() {
    return this.page.getByRole("button", { name: "Publish changes" });
  }

  get submitForValidationButton() {
    return this.page.getByRole("button", { name: "Submit for validation" });
  }

  get cancelValidationButton() {
    return this.page.getByRole("button", { name: "Cancel validation" });
  }
}
