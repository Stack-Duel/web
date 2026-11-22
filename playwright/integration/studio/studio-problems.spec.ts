import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { StudioProblemsPage } from "../../pages/studio-problems-page";
import {
  buildMyProblemListItem,
  buildMyProblemsMetadata,
} from "@/test/factories/problem";
import { mockStudio } from "./mocks";

const PROBLEMS_REQUEST = /\/api\/v1\/problem\/mine\?/;

async function waitForInitialProblemsLoad(page: Page) {
  await page.waitForRequest(
    (req) =>
      PROBLEMS_REQUEST.test(req.url()) &&
      !req.url().includes("statuses=") &&
      !req.url().includes("search=")
  );
}

test(
  "a creator with Studio access sees their problem list",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      problems: [
        buildMyProblemListItem({ title: "Two Sum" }),
        buildMyProblemListItem({
          id: "problem_2",
          slug: "add-two-numbers",
          title: "Add Two Numbers",
        }),
      ],
    });

    await studio.goto();

    await expect(page.getByText("Two Sum")).toBeVisible();
    await expect(page.getByText("Add Two Numbers")).toBeVisible();
  }
);

test(
  "a creator without Studio access sees a not-found page instead of leaking the route",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, { account: { permissions: [] } });

    await studio.goto();

    await expect(
      page.getByText(/we could not find the page you are looking for/i)
    ).toBeVisible();
    await expect(studio.searchInput).not.toBeVisible();
  }
);

test(
  "a creator with no problems yet sees an empty table instead of an error",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, { problems: [] });

    await studio.goto();

    await expect(page.getByText("No results.")).toBeVisible();
  }
);

test(
  "a creator sees their open-problem count against the limit",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      metadata: {
        statusBreakdown: [
          { status: "Draft", count: 2 },
          { status: "Published", count: 5 },
        ],
      },
    });

    await studio.goto();

    await expect(
      page.getByText("2/10 open").filter({ visible: true })
    ).toBeVisible();
  }
);

test(
  "a creator sees their submission, reaction, and completion stats",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      metadata: buildMyProblemsMetadata({
        totalSubmissions: 42,
        totalReactions: 7,
        averageCompletionRate: 0.5,
      }),
    });

    await studio.goto();

    await expect(page.getByText("Total Submissions")).toBeVisible();
    await expect(page.getByText("42")).toBeVisible();
    await expect(page.getByText("Total Reactions")).toBeVisible();
    await expect(page.getByText("7")).toBeVisible();
    await expect(page.getByText("50%")).toBeVisible();
  }
);

test(
  "a creator can filter their problems down to a single status",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      metadata: { statusBreakdown: [{ status: "Draft", count: 1 }] },
    });

    await studio.goto();
    await waitForInitialProblemsLoad(page);

    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("statuses=Draft")),
      studio.statusPill("Draft").click(),
    ]);
    expect(request.url()).toContain("statuses=Draft");
  }
);

test(
  "a creator can select multiple statuses at once",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      metadata: {
        statusBreakdown: [
          { status: "Draft", count: 1 },
          { status: "Pending", count: 1 },
        ],
      },
    });

    await studio.goto();
    await waitForInitialProblemsLoad(page);

    await Promise.all([
      page.waitForRequest((req) => req.url().includes("statuses=Draft")),
      studio.statusPill("Draft").click(),
    ]);

    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("statuses=Pending")),
      studio.statusPill("Pending").click(),
    ]);
    expect(request.url()).toContain("statuses=Draft");
    expect(request.url()).toContain("statuses=Pending");
  }
);

test(
  "clicking All clears a creator's status filters",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page, {
      metadata: { statusBreakdown: [{ status: "Draft", count: 1 }] },
    });

    await studio.goto();
    await waitForInitialProblemsLoad(page);

    await Promise.all([
      page.waitForRequest((req) => req.url().includes("statuses=Draft")),
      studio.statusPill("Draft").click(),
    ]);

    await expect(studio.statusPill("Draft")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(studio.statusPill("All")).toHaveAttribute(
      "aria-pressed",
      "false"
    );

    await studio.statusPill("All").click();

    await expect(studio.statusPill("All")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await expect(studio.statusPill("Draft")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  }
);

test(
  "a creator can search their problems by title",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page);

    await studio.goto();
    await waitForInitialProblemsLoad(page);

    const [request] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("search=two")),
      studio.searchInput.fill("two sum"),
    ]);
    expect(request.url()).toContain("search=two");
  }
);

test(
  "a creator can click New Problem to start creating one",
  { tag: ["@integration"] },
  async ({ page }) => {
    const studio = new StudioProblemsPage(page);
    await mockStudio(page);

    await studio.goto();

    await expect(studio.newProblemLink).toHaveAttribute(
      "href",
      "/studio/problems/new"
    );
  }
);
