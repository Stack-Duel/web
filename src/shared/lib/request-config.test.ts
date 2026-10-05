import { describe, expect, it } from "vitest";
import { toAxiosConfig } from "./request-config";

describe("toAxiosConfig", () => {
  it("omits the Authorization header when there is no access token", () => {
    const config = toAxiosConfig();

    expect(config.headers).toBeUndefined();
  });

  it("adds a bearer Authorization header when an access token is provided", () => {
    const config = toAxiosConfig({ accessToken: "abc123" });

    expect(config.headers).toEqual({ Authorization: "Bearer abc123" });
  });

  it("forwards the abort signal", () => {
    const controller = new AbortController();

    const config = toAxiosConfig({ signal: controller.signal });

    expect(config.signal).toBe(controller.signal);
  });
});
