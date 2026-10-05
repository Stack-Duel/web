import type { ReactNode } from "react";
import { Suspense } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserSetupForm from "./user-setup-form";
import { http } from "@/shared/lib/http";
import { useUserStore } from "../state/user-store";
import { resetUserStore } from "@/test/mocks/user-store";
import { buildUser } from "@/test/factories/user";
import { buildProgrammingLanguage } from "@/test/factories/language-programming-language";
import { routerConfig } from "@/shared/router-config";
import { routerMock } from "@/test/mocks/next-navigation";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/shared/lib/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(http, { deep: true });

function mockAccountAndLanguages(
  user = buildUser({ setupCompletedAt: undefined })
) {
  mockedHttp.get.mockImplementation((url: string) => {
    if (url === "/api/v1/user") return Promise.resolve(user);
    if (url === "/api/v1/language") {
      return Promise.resolve([
        buildProgrammingLanguage({ id: "lang_1", name: "TypeScript" }),
        buildProgrammingLanguage({ id: "lang_2", name: "Python" }),
      ]);
    }
    return Promise.reject(new Error(`Unexpected URL: ${url}`));
  });
}

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Loading setup...</p>}>{children}</Suspense>
    </QueryClientProvider>
  );
  return render(<UserSetupForm />, { wrapper: Wrapper });
}

describe("UserSetupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetUserStore();
    routerMock.push.mockClear();
  });

  it("keeps Next disabled until a valid username is entered", async () => {
    const user = userEvent.setup();
    mockAccountAndLanguages();
    renderForm();

    expect(await screen.findByText("What should we call you?")).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    await user.type(screen.getByPlaceholderText("Username"), "testuser");

    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("walks through every step and submits the chosen username, bio, and language order", async () => {
    const user = userEvent.setup();
    mockAccountAndLanguages();
    mockedHttp.put.mockResolvedValue(buildUser({ username: "testuser" }));
    renderForm();

    await screen.findByText("What should we call you?");
    await user.type(screen.getByPlaceholderText("Username"), "testuser");
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Tell us about yourself")).toBeVisible();
    await user.type(
      screen.getByPlaceholderText("Tell other players a bit about yourself"),
      "hello world"
    );
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(
      await screen.findByText("Which languages do you know?")
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await user.click(
      screen.getByRole("checkbox", { name: "Select TypeScript" })
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Rank your languages")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Finish setup" }));

    await waitFor(() => {
      expect(mockedHttp.put).toHaveBeenCalledWith(
        "/api/v1/user",
        { username: "testuser", bio: "hello world", languageIds: ["lang_1"] },
        expect.anything()
      );
    });
  });

  it("updates the user store and redirects home after a successful submit", async () => {
    const user = userEvent.setup();
    mockAccountAndLanguages();
    mockedHttp.put.mockResolvedValue(undefined);
    renderForm();

    await screen.findByText("What should we call you?");
    await user.type(screen.getByPlaceholderText("Username"), "testuser");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Tell us about yourself");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Which languages do you know?");
    await user.click(
      screen.getByRole("checkbox", { name: "Select TypeScript" })
    );
    await user.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Rank your languages");
    await user.click(screen.getByRole("button", { name: "Finish setup" }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith(routerConfig.home.path);
    });
    expect(useUserStore.getState().user).not.toBeNull();
  });

  it("shows a loading skeleton instead of the form while redirecting home for an already-complete setup", async () => {
    mockAccountAndLanguages(
      buildUser({ setupCompletedAt: new Date("2026-01-01") })
    );
    renderForm();

    expect(
      await screen.findByLabelText("Loading setup form")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("What should we call you?")
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith(routerConfig.home.path);
    });
  });
});
