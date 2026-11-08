import type { Page } from "@playwright/test";
import type { User } from "@/domains/user/models/user";
import type { MyProblemListItem } from "@/domains/problem/models/my-problem";
import type { MyProblemsMetadata } from "@/domains/problem/models/my-problems-metadata";
import type { StudioProblemDetails } from "@/domains/studio/models/studio-problem-details";
import type { StudioProblemSetup } from "@/domains/studio/models/studio-problem-setup";
import type { PageResult } from "@/shared/pagination/page-result";
import { Permissions } from "@/shared/lib/permissions";
import { buildUser } from "@/test/factories/user";
import {
  buildMyProblemListItem,
  buildMyProblemsMetadata,
} from "@/test/factories/problem";
import { buildStudioProblemDetails } from "@/test/factories/studio-problem";
import { mockJson } from "../../support/route-mock";

export function buildStudioAccount(overrides: Partial<User> = {}): User {
  return buildUser({ permissions: [Permissions.ADMIN_PROBLEMS_READ], ...overrides });
}

export async function mockAccount(page: Page, account: User) {
  await mockJson(page, /\/api\/v1\/user(?:\?.*)?$/, account);
}

export async function mockMyProblems(
  page: Page,
  results: MyProblemListItem[]
) {
  const body: PageResult<MyProblemListItem> = {
    results,
    total: results.length,
    page: 1,
    size: 20,
    timestamp: "2026-01-01T00:00:00.000Z",
  };

  await mockJson(page, /\/api\/v1\/problem\/mine(?:\?.*)?$/, body);
}

export async function mockMyProblemsMetadata(
  page: Page,
  metadata: MyProblemsMetadata
) {
  await mockJson(
    page,
    /\/api\/v1\/problem\/mine\/metadata(?:\?.*)?$/,
    metadata
  );
}

export async function mockStudioProblemDetail(
  page: Page,
  problemId: string,
  details: Partial<StudioProblemDetails> = {}
) {
  await mockJson(
    page,
    new RegExp(`/api/v1/studio/problems/${problemId}(?:\\?.*)?$`),
    buildStudioProblemDetails({ problemId, ...details })
  );
}

export async function mockStudioProblemSetups(
  page: Page,
  problemId: string,
  setups: StudioProblemSetup[] = []
) {
  await mockJson(
    page,
    new RegExp(`/api/v1/studio/problems/${problemId}/setups(?:\\?.*)?$`),
    setups
  );
}

type StudioScenario = {
  account?: Partial<User>;
  problems?: MyProblemListItem[];
  metadata?: Partial<MyProblemsMetadata>;
};

export async function mockStudio(page: Page, scenario: StudioScenario = {}) {
  await mockAccount(page, buildStudioAccount(scenario.account));
  await mockMyProblems(page, scenario.problems ?? [buildMyProblemListItem()]);
  await mockMyProblemsMetadata(page, buildMyProblemsMetadata(scenario.metadata));
}
