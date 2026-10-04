import { describe, expect, it, vi } from "vitest";
import { fetchProblemBySlug } from "./problem-server-api";

vi.mock("@/env", () => import("@/test/mocks/env"));

describe("fetchProblemBySlug", () => {
  it("fetches the problem from the API server with a JSON content-type header", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchProblemBySlug({ slug: "two-sum" });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.algowars.test/api/v1/problem/two-sum",
      { headers: { "Content-Type": "application/json" } }
    );

    vi.unstubAllGlobals();
  });
});
