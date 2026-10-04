import { beforeEach, describe, expect, it, vi } from "vitest";

const javascriptMock = vi.fn(
  (options?: { jsx?: boolean; typescript?: boolean }) => ({
    kind: "javascript",
    options,
  })
);
const pythonMock = vi.fn(() => ({ kind: "python" }));
const javaMock = vi.fn(() => ({ kind: "java" }));
const cppMock = vi.fn(() => ({ kind: "cpp" }));

vi.mock("@codemirror/lang-javascript", () => ({
  javascript: javascriptMock,
}));
vi.mock("@codemirror/lang-python", () => ({
  python: pythonMock,
}));
vi.mock("@codemirror/lang-java", () => ({
  java: javaMock,
}));
vi.mock("@codemirror/lang-cpp", () => ({
  cpp: cppMock,
}));

describe("language-extension-map", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("resolves language extensions by name, case- and whitespace-insensitively", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    const extensions = await getLanguageExtensionsByName("  Python  ");

    expect(pythonMock).toHaveBeenCalledTimes(1);
    expect(extensions).toEqual([{ kind: "python" }]);
  });

  it("resolves typescript by name with the typescript flag set", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    await getLanguageExtensionsByName("typescript");

    expect(javascriptMock).toHaveBeenCalledWith({
      jsx: true,
      typescript: true,
    });
  });

  it("resolves java by name", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    const extensions = await getLanguageExtensionsByName("Java");

    expect(javaMock).toHaveBeenCalledTimes(1);
    expect(extensions).toEqual([{ kind: "java" }]);
  });

  it("resolves vanilla js by name without jsx", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    const extensions = await getLanguageExtensionsByName("Vanilla JS");

    expect(javascriptMock).toHaveBeenCalledTimes(1);
    expect(extensions).toEqual([{ kind: "javascript", options: [] }]);
  });

  it("resolves c++ by name", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    const extensions = await getLanguageExtensionsByName("C++");

    expect(cppMock).toHaveBeenCalledTimes(1);
    expect(extensions).toEqual([{ kind: "cpp" }]);
  });

  it("returns an empty array for an unknown language name", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    const extensions = await getLanguageExtensionsByName("cobol");

    expect(extensions).toEqual([]);
  });

  it("caches by name so the loader only runs once per name", async () => {
    const { getLanguageExtensionsByName } =
      await import("./language-extension-map");

    await getLanguageExtensionsByName("python");
    await getLanguageExtensionsByName("python");

    expect(pythonMock).toHaveBeenCalledTimes(1);
  });
});
