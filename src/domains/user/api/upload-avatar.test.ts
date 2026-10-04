import { describe, expect, it, vi } from "vitest";
import { uploadAvatar } from "./upload-avatar";
import { http } from "@/shared/lib/http";

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

describe("uploadAvatar", () => {
  it("posts the file as multipart form data with the content-type header cleared", async () => {
    const controller = new AbortController();
    const file = new File(["content"], "avatar.png", { type: "image/png" });
    mockedHttp.post.mockResolvedValue("https://storage.example.com/a.png");

    await uploadAvatar({ file, signal: controller.signal });

    expect(mockedHttp.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = mockedHttp.post.mock.calls[0];
    expect(url).toBe("/api/v1/user/avatar");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect(config).toEqual({
      signal: controller.signal,
      headers: { "Content-Type": undefined },
    });
  });
});
