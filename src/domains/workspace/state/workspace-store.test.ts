import { beforeEach, describe, expect, it } from "vitest";
import { MAIN_FILE_KEY, useWorkspaceStore } from "./workspace-store";
import type { ProblemSetup } from "@/domains/problem/models/problem-setup";

const initialState = useWorkspaceStore.getState();

function resetWorkspaceStore() {
  useWorkspaceStore.setState(initialState, true);
}

describe("useWorkspaceStore", () => {
  beforeEach(() => {
    resetWorkspaceStore();
  });

  it("selects a version", () => {
    useWorkspaceStore.getState().selectVersion("v1");

    expect(useWorkspaceStore.getState().selectedVersionId).toBe("v1");
  });

  it("sets the code", () => {
    useWorkspaceStore.getState().setCode("print('hi')");

    expect(useWorkspaceStore.getState().code).toBe("print('hi')");
  });

  it("adds a custom test case with at least one input field", () => {
    useWorkspaceStore.getState().addCustomTestCase(0);

    expect(useWorkspaceStore.getState().customTestCases).toEqual([
      { inputs: [""] },
    ]);
  });

  it("adds a custom test case with the requested number of input fields", () => {
    useWorkspaceStore.getState().addCustomTestCase(3);

    expect(useWorkspaceStore.getState().customTestCases).toEqual([
      { inputs: ["", "", ""] },
    ]);
  });

  it("removes a custom test case by index", () => {
    useWorkspaceStore.getState().addCustomTestCase(1);
    useWorkspaceStore.getState().addCustomTestCase(1);

    useWorkspaceStore.getState().removeCustomTestCase(0);

    expect(useWorkspaceStore.getState().customTestCases).toHaveLength(1);
  });

  it("updates a single input within a custom test case", () => {
    useWorkspaceStore.getState().addCustomTestCase(2);

    useWorkspaceStore.getState().updateCustomTestCaseInput(0, 1, "value");

    expect(useWorkspaceStore.getState().customTestCases).toEqual([
      { inputs: ["", "value"] },
    ]);
  });

  it("beginSubmission clears the active submission id and marks submitting", () => {
    useWorkspaceStore.getState().setActiveSubmissionId("sub-1");

    useWorkspaceStore.getState().beginSubmission();

    expect(useWorkspaceStore.getState().activeSubmissionId).toBeNull();
    expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(true);
  });

  it("sets the submitting flag independently", () => {
    useWorkspaceStore.getState().setSubmittingSubmission(true);
    expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(true);

    useWorkspaceStore.getState().setSubmittingSubmission(false);
    expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(false);
  });

  it("sets the active submission id", () => {
    useWorkspaceStore.getState().setActiveSubmissionId("sub-2");

    expect(useWorkspaceStore.getState().activeSubmissionId).toBe("sub-2");
  });

  it("onNewProblem clears the version marker, active submission, and custom test cases", () => {
    useWorkspaceStore.setState({
      codeVersionId: "v1",
      activeSubmissionId: "sub-1",
      customTestCases: [{ inputs: ["x"] }],
    });

    useWorkspaceStore.getState().onNewProblem();

    expect(useWorkspaceStore.getState().codeVersionId).toBeNull();
    expect(useWorkspaceStore.getState().activeSubmissionId).toBeNull();
    expect(useWorkspaceStore.getState().customTestCases).toEqual([]);
  });

  it("onProblemSetupLoaded resets the code when the language version changed", () => {
    useWorkspaceStore.setState({ code: "old code", codeVersionId: null });
    const setup = { initialCode: "def solve(): pass" } as ProblemSetup;

    useWorkspaceStore.getState().onProblemSetupLoaded(setup, "v1");

    expect(useWorkspaceStore.getState().code).toBe("def solve(): pass");
    expect(useWorkspaceStore.getState().codeVersionId).toBe("v1");
  });

  it("onProblemSetupLoaded falls back to an empty string when initialCode is missing", () => {
    const setup = {} as ProblemSetup;

    useWorkspaceStore.getState().onProblemSetupLoaded(setup, "v1");

    expect(useWorkspaceStore.getState().code).toBe("");
  });

  it("onProblemSetupLoaded opens every additional file from the setup", () => {
    const setup = {
      additionalFiles: [
        { path: "A.jsx", content: "" },
        { path: "B.jsx", content: "" },
      ],
    } as ProblemSetup;

    useWorkspaceStore.getState().onProblemSetupLoaded(setup, "v1");

    expect(useWorkspaceStore.getState().openFileKeys).toEqual([
      "A.jsx",
      "B.jsx",
    ]);
  });

  it("onProblemSetupLoaded keeps the existing code when the version is unchanged", () => {
    useWorkspaceStore.setState({
      code: "my code",
      codeVersionId: "v1",
      activeSubmissionId: "sub-1",
    });
    const setup = { initialCode: "template" } as ProblemSetup;

    useWorkspaceStore.getState().onProblemSetupLoaded(setup, "v1");

    expect(useWorkspaceStore.getState().code).toBe("my code");
    expect(useWorkspaceStore.getState().activeSubmissionId).toBe("sub-1");
  });

  it("sets the active tab for a given node", () => {
    useWorkspaceStore.getState().setActiveTab("root", 2);
    useWorkspaceStore.getState().setActiveTab("root.1", 1);

    expect(useWorkspaceStore.getState().activeTabByNode).toEqual({
      root: 2,
      "root.1": 1,
    });
  });

  it("requests focus while updating the highlighted file", () => {
    useWorkspaceStore.getState().requestFocusFile("Helper.jsx");
    expect(useWorkspaceStore.getState().activeFileKey).toBe("Helper.jsx");
    expect(useWorkspaceStore.getState().focusFileRequest).toEqual({
      key: "Helper.jsx",
      requestId: 1,
    });

    useWorkspaceStore.getState().requestFocusFile("Helper.jsx");
    expect(useWorkspaceStore.getState().focusFileRequest?.requestId).toBe(2);
  });

  it("opens a newly added file as a tab", () => {
    useWorkspaceStore.getState().addFile("Helper.jsx");

    expect(useWorkspaceStore.getState().openFileKeys).toEqual(["Helper.jsx"]);
    expect(useWorkspaceStore.getState().activeFileKey).toBe("Helper.jsx");
  });

  it("reopens an already-closed file when it's focused again", () => {
    useWorkspaceStore.setState({
      additionalFiles: [{ path: "Helper.jsx", content: "" }],
      openFileKeys: [],
    });

    useWorkspaceStore.getState().requestFocusFile("Helper.jsx");

    expect(useWorkspaceStore.getState().openFileKeys).toEqual(["Helper.jsx"]);
  });

  it("closeFile removes the tab without touching the file itself", () => {
    useWorkspaceStore.setState({
      additionalFiles: [{ path: "Helper.jsx", content: "code" }],
      openFileKeys: ["Helper.jsx"],
      activeFileKey: "Helper.jsx",
    });

    useWorkspaceStore.getState().closeFile("Helper.jsx");

    expect(useWorkspaceStore.getState().openFileKeys).toEqual([]);
    expect(useWorkspaceStore.getState().additionalFiles).toEqual([
      { path: "Helper.jsx", content: "code" },
    ]);
  });

  it("closeFile falls back to another open tab when the closed file was active", () => {
    useWorkspaceStore.setState({
      additionalFiles: [
        { path: "A.jsx", content: "" },
        { path: "B.jsx", content: "" },
      ],
      openFileKeys: ["A.jsx", "B.jsx"],
      activeFileKey: "B.jsx",
    });

    useWorkspaceStore.getState().closeFile("B.jsx");

    expect(useWorkspaceStore.getState().activeFileKey).toBe("A.jsx");
    expect(useWorkspaceStore.getState().focusFileRequest?.key).toBe("A.jsx");
  });

  it("closeFile falls back to the main file when no other tab is open", () => {
    useWorkspaceStore.setState({
      additionalFiles: [{ path: "A.jsx", content: "" }],
      openFileKeys: ["A.jsx"],
      activeFileKey: "A.jsx",
    });

    useWorkspaceStore.getState().closeFile("A.jsx");

    expect(useWorkspaceStore.getState().activeFileKey).toBe(MAIN_FILE_KEY);
  });

  it("closeFile leaves the active file alone when closing a different tab", () => {
    useWorkspaceStore.setState({
      additionalFiles: [
        { path: "A.jsx", content: "" },
        { path: "B.jsx", content: "" },
      ],
      openFileKeys: ["A.jsx", "B.jsx"],
      activeFileKey: "B.jsx",
    });

    useWorkspaceStore.getState().closeFile("A.jsx");

    expect(useWorkspaceStore.getState().activeFileKey).toBe("B.jsx");
    expect(useWorkspaceStore.getState().openFileKeys).toEqual(["B.jsx"]);
  });

  it("deleteFile removes the file and its tab", () => {
    useWorkspaceStore.setState({
      additionalFiles: [
        { path: "A.jsx", content: "" },
        { path: "B.jsx", content: "" },
      ],
      openFileKeys: ["A.jsx", "B.jsx"],
      activeFileKey: "A.jsx",
    });

    useWorkspaceStore.getState().deleteFile("A.jsx");

    expect(useWorkspaceStore.getState().additionalFiles).toEqual([
      { path: "B.jsx", content: "" },
    ]);
    expect(useWorkspaceStore.getState().openFileKeys).toEqual(["B.jsx"]);
    expect(useWorkspaceStore.getState().activeFileKey).toBe("B.jsx");
  });

  it("renameFile updates the file's path, its open tab, and the active key", () => {
    useWorkspaceStore.setState({
      additionalFiles: [{ path: "Old.jsx", content: "code" }],
      openFileKeys: ["Old.jsx"],
      activeFileKey: "Old.jsx",
    });

    useWorkspaceStore.getState().renameFile("Old.jsx", "New.jsx");

    expect(useWorkspaceStore.getState().additionalFiles).toEqual([
      { path: "New.jsx", content: "code" },
    ]);
    expect(useWorkspaceStore.getState().openFileKeys).toEqual(["New.jsx"]);
    expect(useWorkspaceStore.getState().activeFileKey).toBe("New.jsx");
  });

  it("renameFile leaves the active key alone when renaming a different file", () => {
    useWorkspaceStore.setState({
      additionalFiles: [
        { path: "A.jsx", content: "" },
        { path: "B.jsx", content: "" },
      ],
      openFileKeys: ["A.jsx", "B.jsx"],
      activeFileKey: "B.jsx",
    });

    useWorkspaceStore.getState().renameFile("A.jsx", "A2.jsx");

    expect(useWorkspaceStore.getState().activeFileKey).toBe("B.jsx");
    expect(useWorkspaceStore.getState().openFileKeys).toEqual([
      "A2.jsx",
      "B.jsx",
    ]);
  });

  it("deleteFile falls back to the main file when the deleted file was the only one active", () => {
    useWorkspaceStore.setState({
      additionalFiles: [{ path: "A.jsx", content: "" }],
      openFileKeys: ["A.jsx"],
      activeFileKey: "A.jsx",
    });

    useWorkspaceStore.getState().deleteFile("A.jsx");

    expect(useWorkspaceStore.getState().additionalFiles).toEqual([]);
    expect(useWorkspaceStore.getState().activeFileKey).toBe(MAIN_FILE_KEY);
  });

  it("resets the entire store back to its initial state", () => {
    useWorkspaceStore.setState({
      code: "dirty",
      selectedVersionId: "v1",
      isSubmittingSubmission: true,
    });

    useWorkspaceStore.getState().reset();

    expect(useWorkspaceStore.getState().code).toBe("");
    expect(useWorkspaceStore.getState().selectedVersionId).toBeNull();
    expect(useWorkspaceStore.getState().isSubmittingSubmission).toBe(false);
  });
});
