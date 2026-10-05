import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProfileTab from "./profile-tab";
import {
  accountQueryOptions,
  useAccount,
} from "@/domains/user/api/get-account";
import { useUpdateUsername } from "@/domains/user/api/update-username";
import { useUpdateProfilePrivacy } from "@/domains/user/api/update-profile-privacy";
import { useAvatarHistory } from "@/domains/user/api/get-avatar-history";
import { useUploadAvatar } from "@/domains/user/api/upload-avatar";
import { useSelectAvatar } from "@/domains/user/api/select-avatar";
import { useUserStore } from "@/domains/user/state/user-store";
import { buildUser } from "@/test/factories/user";
import { routerMock } from "@/test/mocks/next-navigation";
import { routerConfig } from "@/shared/router-config";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));
vi.mock("@/domains/user/api/get-account");
vi.mock("@/domains/user/api/update-username");
vi.mock("@/domains/user/api/update-profile-privacy");
vi.mock("@/domains/user/api/get-avatar-history");
vi.mock("@/domains/user/api/upload-avatar");
vi.mock("@/domains/user/api/select-avatar");

const mockUseAccount = vi.mocked(useAccount);
const mockUseUpdateUsername = vi.mocked(useUpdateUsername);
const mockAccountQueryOptions = vi.mocked(accountQueryOptions);
const mockUseUpdateProfilePrivacy = vi.mocked(useUpdateProfilePrivacy);
const mockUseAvatarHistory = vi.mocked(useAvatarHistory);
const mockUseUploadAvatar = vi.mocked(useUploadAvatar);
const mockUseSelectAvatar = vi.mocked(useSelectAvatar);

function renderProfileTab() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileTab />
    </QueryClientProvider>
  );
}

describe("ProfileTab", () => {
  const usernameMutate = vi.fn();
  const privacyMutate = vi.fn();

  beforeEach(() => {
    useUserStore.setState({ user: buildUser() });
    mockUseUpdateUsername.mockReturnValue({
      mutate: usernameMutate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useUpdateUsername>);
    mockUseUpdateProfilePrivacy.mockReturnValue({
      mutate: privacyMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateProfilePrivacy>);
    mockUseAvatarHistory.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useAvatarHistory>);
    mockUseUploadAvatar.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useUploadAvatar>);
    mockUseSelectAvatar.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useSelectAvatar>);
  });

  it("shows a loading skeleton while the account loads", () => {
    mockUseAccount.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useAccount>);

    renderProfileTab();

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("pre-fills the username and bio fields", () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada", bio: "hello" }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);

    renderProfileTab();

    expect(screen.getByLabelText("Username")).toHaveValue("ada");
    expect(screen.getByLabelText("Bio")).toHaveValue("hello");
  });

  it("locks the username field within the 30-day cooldown", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    mockUseAccount.mockReturnValue({
      data: buildUser({
        username: "ada",
        usernameLastChangedAt: new Date("2026-05-20T00:00:00.000Z"),
      }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);

    renderProfileTab();
    vi.useRealTimers();

    expect(screen.getByLabelText("Username")).toBeDisabled();
    expect(screen.getByText(/can change your username again on/)).toBeVisible();
  });

  it("leaves the username field editable once the cooldown has passed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    mockUseAccount.mockReturnValue({
      data: buildUser({
        username: "ada",
        usernameLastChangedAt: new Date("2026-01-01T00:00:00.000Z"),
      }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);

    renderProfileTab();
    vi.useRealTimers();

    expect(screen.getByLabelText("Username")).toBeEnabled();
  });

  it("submits the edited username and bio", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada", bio: "" }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    const user = userEvent.setup();

    renderProfileTab();

    await user.clear(screen.getByLabelText("Bio"));
    await user.type(screen.getByLabelText("Bio"), "new bio");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(usernameMutate).toHaveBeenCalledWith(
      expect.objectContaining({ username: "ada", bio: "new bio" })
    );
  });

  it("redirects to the public profile page once the save completes", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada", bio: "" }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);

    let capturedOnSuccess: (() => void | Promise<void>) | undefined;
    mockUseUpdateUsername.mockImplementation((options) => {
      capturedOnSuccess = options?.mutationConfig?.onSuccess as
        (() => void | Promise<void>) | undefined;
      return {
        mutate: usernameMutate,
        isPending: false,
        error: null,
      } as unknown as ReturnType<typeof useUpdateUsername>;
    });
    mockAccountQueryOptions.mockReturnValue({
      queryKey: ["account"],
      queryFn: () => Promise.resolve(buildUser({ username: "ada" })),
    } as unknown as ReturnType<typeof accountQueryOptions>);

    const user = userEvent.setup();
    renderProfileTab();

    await user.clear(screen.getByLabelText("Bio"));
    await user.type(screen.getByLabelText("Bio"), "new bio");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await capturedOnSuccess?.();

    expect(routerMock.push).toHaveBeenCalledWith(
      routerConfig.profile.execute({ username: "ada" })
    );
  });

  it("shows the private state and toggles to public", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada", isPrivate: true }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    const user = userEvent.setup();

    renderProfileTab();

    expect(screen.getByText(/Your profile is private/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Make public" }));

    expect(privacyMutate).toHaveBeenCalledWith({ isPrivate: false });
  });

  it("shows the avatar picker inline without opening a dialog", () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada" }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);

    renderProfileTab();

    expect(screen.getByLabelText("Upload new avatar")).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the public state and toggles to private", async () => {
    mockUseAccount.mockReturnValue({
      data: buildUser({ username: "ada", isPrivate: false }),
      isLoading: false,
    } as unknown as ReturnType<typeof useAccount>);
    const user = userEvent.setup();

    renderProfileTab();

    expect(screen.getByText(/Your profile is public/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Make private" }));

    expect(privacyMutate).toHaveBeenCalledWith({ isPrivate: true });
  });
});
