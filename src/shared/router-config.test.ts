import { describe, expect, it } from "vitest";
import { routerConfig } from "./router-config";

describe("routerConfig", () => {
  it("builds the admin submission detail path with an encoded id", () => {
    expect(routerConfig.adminSubmissionDetail.execute({ id: "sub 1" })).toBe(
      "/admin/submissions/sub%201"
    );
  });

  it("builds the admin problem detail path with an encoded id", () => {
    expect(routerConfig.adminProblemDetail.execute({ id: "prob/1" })).toBe(
      "/admin/problems/prob%2F1"
    );
  });

  it("builds the game play path with an encoded gameId", () => {
    expect(routerConfig.gamePlay.execute({ gameId: "game 42" })).toBe(
      "/game/play/game%2042"
    );
  });

  it("builds the games path without a mode query param when omitted", () => {
    expect(routerConfig.games.execute()).toBe("/games");
    expect(routerConfig.games.execute(undefined)).toBe("/games");
    expect(routerConfig.games.execute({})).toBe("/games");
  });

  it("builds the games path with an encoded mode query param when provided", () => {
    expect(routerConfig.games.execute({ mode: "duel & ffa" })).toBe(
      "/games?mode=duel%20%26%20ffa"
    );
  });

  it("builds the problem path with an encoded slug", () => {
    expect(routerConfig.problem.execute({ slug: "two-sum" })).toBe(
      "/problems/two-sum"
    );
  });

  it("builds the problem submissions path with an encoded slug", () => {
    expect(routerConfig.problemSubmissions.execute({ slug: "two sum" })).toBe(
      "/problems/two%20sum/submissions"
    );
  });

  it("builds the profile path with an encoded username", () => {
    expect(routerConfig.profile.execute({ username: "user/name" })).toBe(
      "/profile/user%2Fname"
    );
  });

  it("exposes static paths for routes without params", () => {
    expect(routerConfig.adminUsers.path).toBe("/admin/users");
    expect(routerConfig.adminSubmissions.path).toBe("/admin/submissions");
    expect(routerConfig.adminProblems.path).toBe("/admin/problems");
    expect(routerConfig.authLogIn.path).toBe("/auth/login");
    expect(routerConfig.authSignUp.path).toBe(
      "/auth/login?screen_hint=signup&returnTo=/user/setup"
    );
    expect(routerConfig.authLogOut.path).toBe("/auth/logout");
    expect(routerConfig.home.path).toBe("/");
    expect(routerConfig.dashboard.path).toBe("/dashboard");
    expect(routerConfig.problems.path).toBe("/problems");
    expect(routerConfig.profileSettings.path).toBe("/settings");
    expect(routerConfig.settingsAccount.path).toBe("/settings/account");
    expect(routerConfig.settingsPreferences.path).toBe("/settings/preferences");
    expect(routerConfig.settingsProfile.path).toBe("/settings/profile");
    expect(routerConfig.userSetup.path).toBe("/user/setup");
  });
});
