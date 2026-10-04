import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileContent from "./profile-content";
import { useSuspenseUserProfile } from "@/domains/user/api/get-user-profile";
import { useFeatureFlag } from "@/domains/feature-flags/hooks/use-feature-flag";
import { routerConfig } from "@/shared/router-config";
import type { UserProfile } from "@/domains/user/models/user-profile";

vi.mock("@/env", () => import("@/test/mocks/env"));
vi.mock("@/domains/user/api/get-user-profile");
vi.mock("@/domains/feature-flags/hooks/use-feature-flag", () => ({
  useFeatureFlag: vi.fn(),
}));
vi.mock("@/domains/rating/components/rating-history-chart", () => ({
  default: () => <div data-testid="rating-history-chart" />,
}));

const mockUseSuspenseUserProfile = vi.mocked(useSuspenseUserProfile);
const mockUseFeatureFlag = vi.mocked(useFeatureFlag);

function mockProfile(overrides: Partial<UserProfile> = {}) {
  const profile: UserProfile = {
    id: "u1",
    username: "ada",
    bio: null,
    imageUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    isPrivate: false,
    isOwnProfile: false,
    gameModeStats: [],
    recentGames: [],
    recentSubmissions: [],
    submissionCalendar: [],
    submissionCalendarRangeStart: "2026-01-01",
    submissionCalendarRangeEnd: "2026-01-02",
    ...overrides,
  };
  mockUseSuspenseUserProfile.mockReturnValue({
    data: profile,
  } as unknown as ReturnType<typeof useSuspenseUserProfile>);
  return profile;
}

describe("ProfileContent", () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(false);
  });

  it("shows a private message and hides stats when the profile is private", () => {
    mockProfile({
      gameModeStats: null,
      recentGames: null,
      recentSubmissions: null,
      submissionCalendar: null,
      submissionCalendarRangeStart: null,
      submissionCalendarRangeEnd: null,
    });

    render(<ProfileContent username="ada" />);

    expect(screen.getByText("This profile is private.")).toBeVisible();
    expect(screen.queryByText("Game mode stats")).not.toBeInTheDocument();
  });

  it("shows a Private badge when isPrivate is true", () => {
    mockProfile({ isPrivate: true });

    render(<ProfileContent username="ada" />);

    expect(screen.getByText("Private")).toBeVisible();
  });

  it("shows an Edit profile link for the viewer's own profile", () => {
    mockProfile({ isOwnProfile: true });

    render(<ProfileContent username="ada" />);

    expect(screen.getByRole("link", { name: /Edit profile/ })).toHaveAttribute(
      "href",
      routerConfig.settingsProfile.path
    );
  });

  it("does not show an Edit profile link for someone else's profile", () => {
    mockProfile({ isOwnProfile: false });

    render(<ProfileContent username="ada" />);

    expect(
      screen.queryByRole("link", { name: /Edit profile/ })
    ).not.toBeInTheDocument();
  });

  it("shows empty-state messages when there are no games or submissions", async () => {
    const user = userEvent.setup();
    mockProfile();

    render(<ProfileContent username="ada" />);

    expect(screen.getAllByText("No completed games yet.")).toHaveLength(2);

    await user.click(screen.getByRole("tab", { name: /Recent submissions/ }));

    expect(screen.getByText("No submissions yet.")).toBeVisible();
  });

  it("shows win/loss/draw percentages and a bar for game modes with opponents", () => {
    mockProfile({
      gameModeStats: [
        {
          gameModeKey: "duel",
          gameModeName: "Duel",
          hasOpponents: true,
          gamesPlayed: 4,
          wins: 3,
          losses: 1,
          draws: 0,
          bestScore: 0,
        },
      ],
    });

    render(<ProfileContent username="ada" />);

    expect(
      screen.getByText("4 played · 3W 1L 0D · 75% / 25% / 0%")
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: "75% wins, 25% losses, 0% ties" })
    ).toBeVisible();
  });

  it("shows the best score for solo game modes without opponents", () => {
    mockProfile({
      gameModeStats: [
        {
          gameModeKey: "solo-rush",
          gameModeName: "Solo Rush",
          hasOpponents: false,
          gamesPlayed: 2,
          wins: 0,
          losses: 0,
          draws: 0,
          bestScore: 42,
        },
      ],
    });

    render(<ProfileContent username="ada" />);

    expect(screen.getByText("2 played · best score: 42")).toBeVisible();
  });

  it("links a recent submission to its problem page", async () => {
    const user = userEvent.setup();
    mockProfile({
      recentSubmissions: [
        {
          id: "sub1",
          status: "WrongAnswer",
          problemTitle: "Two Sum",
          problemSlug: "two-sum",
          language: { id: "py", name: "Python", version: "3.12" },
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    render(<ProfileContent username="ada" />);
    await user.click(screen.getByRole("tab", { name: /Recent submissions/ }));

    expect(screen.getByRole("link", { name: "Two Sum" })).toHaveAttribute(
      "href",
      routerConfig.problem.execute({ slug: "two-sum" })
    );
    expect(screen.getByText("WrongAnswer")).toBeVisible();
  });

  it("shows a submission activity total when calendar data is present", () => {
    mockProfile({
      submissionCalendar: [
        { date: "2026-01-01", count: 2 },
        { date: "2026-01-02", count: 0 },
      ],
    });

    render(<ProfileContent username="ada" />);

    expect(
      screen.getByText(/2 submissions in the last 12 months/)
    ).toBeVisible();
  });

  it("shows the rating history chart on the viewer's own profile when ratings are enabled", () => {
    mockUseFeatureFlag.mockReturnValue(true);
    mockProfile({ isOwnProfile: true });

    render(<ProfileContent username="ada" />);

    expect(screen.getByTestId("rating-history-chart")).toBeVisible();
  });

  it("hides the rating history chart when the ratings feature flag is disabled", () => {
    mockUseFeatureFlag.mockReturnValue(false);
    mockProfile({ isOwnProfile: true });

    render(<ProfileContent username="ada" />);

    expect(
      screen.queryByTestId("rating-history-chart")
    ).not.toBeInTheDocument();
  });

  it("hides the rating history chart on someone else's profile", () => {
    mockUseFeatureFlag.mockReturnValue(true);
    mockProfile({ isOwnProfile: false });

    render(<ProfileContent username="ada" />);

    expect(
      screen.queryByTestId("rating-history-chart")
    ).not.toBeInTheDocument();
  });

  it("shows game participants with the viewer highlighted", () => {
    mockProfile({
      recentGames: [
        {
          gameId: "g1",
          gameModeKey: "duel",
          gameModeName: "Duel",
          endedAt: "2026-01-01T00:00:00.000Z",
          participants: [
            { username: "ada", imageUrl: null, score: 10 },
            { username: "rival", imageUrl: null, score: 8 },
          ],
        },
      ],
    });

    render(<ProfileContent username="ada" />);

    expect(screen.getByText("ada: 10")).toHaveClass("font-semibold");
    expect(screen.getByText("rival: 8")).toHaveClass("text-muted-foreground");
  });
});
