import { create } from "zustand";
import type { ProblemSetup } from "@/domains/problem/models/problem-setup";

export type CustomTestCase = {
  inputs: string[];
};

export type WorkspaceFile = {
  path: string;
  content: string;
};

/** Sentinel identifying the main solution file, distinct from any real
 *  additional-file path, which are always author/user-chosen filenames. */
export const MAIN_FILE_KEY = "__main__";

interface WorkspaceState {
  selectedVersionId: string | null;
  code: string;
  /** Extra files alongside the main solution file (e.g. a helper component).
   *  Empty for every language/problem that doesn't use multi-file support. */
  additionalFiles: WorkspaceFile[];
  /** Which file the simple (single-pane) editor is currently showing:
   *  `MAIN_FILE_KEY` or a path into `additionalFiles`. Only used by the
   *  mobile/non-multi-window editor; the drag-split desktop editor tracks
   *  "active" per pane instead, via `activeTabByNode`. */
  activeFileKey: string;
  openFileKeys: string[];
  /** A one-shot request for the drag-split editor to bring the tab for this
   *  file key to the front of whichever pane it currently lives in. Set by
   *  the file explorer, consumed by `EditorWindowTab`. `requestId` always
   *  increments so re-clicking the same already-focused file still fires. */
  focusFileRequest: { key: string; requestId: number } | null;
  /** The component/function name the active problem setup expects the solution
   *  to define (e.g. "Counter"), used by the React live preview to reference
   *  the user's code without requiring an explicit export. Null for setups
   *  that don't define one. */
  functionName: string | null;
  /** The languageVersionId that `code` was loaded for. Cleared whenever a new
   *  problem is initialized so the next setup load resets the editor. Used to
   *  distinguish "same problem, same language, setup reloaded again" (keep code)
   *  from "new problem" (reset code) or "language switched" (reset code). */
  codeVersionId: string | null;
  /** User-authored test cases for Run (not Submit/Grade, which always use the
   *  hidden/random pool). Cleared whenever a new problem is initialized, same as
   *  the editor code, since the input shape is problem-specific. */
  customTestCases: CustomTestCase[];
  isSubmittingSubmission: boolean;
  activeSubmissionId: string | null;
  activeTabByNode: Record<string, number>;

  selectVersion: (versionId: string | null) => void;
  setCode: (code: string) => void;
  setActiveFile: (key: string) => void;
  requestFocusFile: (key: string) => void;
  updateFileContent: (key: string, content: string) => void;
  addFile: (path: string) => void;
  closeFile: (key: string) => void;
  deleteFile: (path: string) => void;
  renameFile: (oldPath: string, newPath: string) => void;
  addCustomTestCase: (inputCount: number) => void;
  removeCustomTestCase: (caseIndex: number) => void;
  updateCustomTestCaseInput: (
    caseIndex: number,
    inputIndex: number,
    value: string
  ) => void;
  /** Flip the "submitting" UI state on synchronously. Mirrors the old
   *  runCodeRequested/submitCodeRequested reducers, which cleared
   *  activeSubmissionId and set isSubmittingSubmission in the same update so the
   *  two flags never render out of sync (the old "previous-status flash" bug). */
  beginSubmission: () => void;
  setSubmittingSubmission: (isSubmitting: boolean) => void;
  setActiveSubmissionId: (submissionId: string | null) => void;
  onNewProblem: () => void;
  onProblemSetupLoaded: (
    setup: ProblemSetup,
    languageVersionId: string
  ) => void;
  setActiveTab: (nodeId: string, tabIndex: number) => void;
  reset: () => void;
}

const initialState = {
  selectedVersionId: null,
  code: "",
  additionalFiles: [],
  activeFileKey: MAIN_FILE_KEY,
  openFileKeys: [],
  focusFileRequest: null,
  functionName: null,
  codeVersionId: null,
  customTestCases: [],
  isSubmittingSubmission: false,
  activeSubmissionId: null,
  activeTabByNode: {},
} satisfies Partial<WorkspaceState>;

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,

  selectVersion: (versionId) => set({ selectedVersionId: versionId }),

  setCode: (code) => set({ code }),

  setActiveFile: (key) => set({ activeFileKey: key }),

  requestFocusFile: (key) =>
    set((state) => ({
      activeFileKey: key,
      openFileKeys:
        key === MAIN_FILE_KEY || state.openFileKeys.includes(key)
          ? state.openFileKeys
          : [...state.openFileKeys, key],
      focusFileRequest: {
        key,
        requestId: (state.focusFileRequest?.requestId ?? 0) + 1,
      },
    })),

  updateFileContent: (key, content) =>
    set((state) =>
      key === MAIN_FILE_KEY
        ? { code: content }
        : {
            additionalFiles: state.additionalFiles.map((file) =>
              file.path === key ? { ...file, content } : file
            ),
          }
    ),

  addFile: (path) =>
    set((state) => ({
      additionalFiles: [...state.additionalFiles, { path, content: "" }],
      activeFileKey: path,
      openFileKeys: [...state.openFileKeys, path],
    })),

  closeFile: (key) =>
    set((state) => {
      const openFileKeys = state.openFileKeys.filter((k) => k !== key);
      if (state.activeFileKey !== key) {
        return { openFileKeys };
      }
      const fallbackKey =
        openFileKeys[openFileKeys.length - 1] ?? MAIN_FILE_KEY;
      return {
        openFileKeys,
        activeFileKey: fallbackKey,
        focusFileRequest: {
          key: fallbackKey,
          requestId: (state.focusFileRequest?.requestId ?? 0) + 1,
        },
      };
    }),

  deleteFile: (path) =>
    set((state) => {
      const additionalFiles = state.additionalFiles.filter(
        (file) => file.path !== path
      );
      const openFileKeys = state.openFileKeys.filter((key) => key !== path);
      if (state.activeFileKey !== path) {
        return { additionalFiles, openFileKeys };
      }
      const fallbackKey =
        openFileKeys[openFileKeys.length - 1] ?? MAIN_FILE_KEY;
      return {
        additionalFiles,
        openFileKeys,
        activeFileKey: fallbackKey,
        focusFileRequest: {
          key: fallbackKey,
          requestId: (state.focusFileRequest?.requestId ?? 0) + 1,
        },
      };
    }),

  renameFile: (oldPath, newPath) =>
    set((state) => {
      if (oldPath === newPath) return {};
      return {
        additionalFiles: state.additionalFiles.map((file) =>
          file.path === oldPath ? { ...file, path: newPath } : file
        ),
        openFileKeys: state.openFileKeys.map((key) =>
          key === oldPath ? newPath : key
        ),
        activeFileKey:
          state.activeFileKey === oldPath ? newPath : state.activeFileKey,
      };
    }),

  addCustomTestCase: (inputCount) =>
    set((state) => ({
      customTestCases: [
        ...state.customTestCases,
        { inputs: Array.from({ length: Math.max(inputCount, 1) }, () => "") },
      ],
    })),

  removeCustomTestCase: (caseIndex) =>
    set((state) => ({
      customTestCases: state.customTestCases.filter((_, i) => i !== caseIndex),
    })),

  updateCustomTestCaseInput: (caseIndex, inputIndex, value) =>
    set((state) => ({
      customTestCases: state.customTestCases.map((testCase, i) =>
        i === caseIndex
          ? {
              inputs: testCase.inputs.map((input, j) =>
                j === inputIndex ? value : input
              ),
            }
          : testCase
      ),
    })),

  beginSubmission: () =>
    set({ activeSubmissionId: null, isSubmittingSubmission: true }),

  setSubmittingSubmission: (isSubmitting) =>
    set({ isSubmittingSubmission: isSubmitting }),

  setActiveSubmissionId: (submissionId) =>
    set({ activeSubmissionId: submissionId }),

  onNewProblem: () =>
    set({ codeVersionId: null, activeSubmissionId: null, customTestCases: [] }),

  onProblemSetupLoaded: (setup, languageVersionId) =>
    set((state) => {
      if (languageVersionId !== state.codeVersionId) {
        const additionalFiles = setup.additionalFiles ?? [];
        return {
          code: setup.initialCode ?? "",
          additionalFiles,
          openFileKeys: additionalFiles.map((file) => file.path),
          activeFileKey: MAIN_FILE_KEY,
          focusFileRequest: null,
          functionName: setup.functionName ?? null,
          codeVersionId: languageVersionId,
        };
      }
      return {};
    }),

  setActiveTab: (nodeId, tabIndex) =>
    set((state) => ({
      activeTabByNode: { ...state.activeTabByNode, [nodeId]: tabIndex },
    })),

  reset: () => set(initialState),
}));

export const selectSelectedVersionId = (s: WorkspaceState) =>
  s.selectedVersionId;

export const selectWorkspaceCode = (s: WorkspaceState) => s.code;

export const selectAdditionalFiles = (s: WorkspaceState) => s.additionalFiles;

export const selectActiveFileKey = (s: WorkspaceState) => s.activeFileKey;

export const selectOpenFileKeys = (s: WorkspaceState) => s.openFileKeys;

export const selectFocusFileRequest = (s: WorkspaceState) => s.focusFileRequest;

export const selectFunctionName = (s: WorkspaceState) => s.functionName;

export const selectCustomTestCases = (s: WorkspaceState) => s.customTestCases;

export const selectIsSubmittingSubmission = (s: WorkspaceState) =>
  s.isSubmittingSubmission;

export const selectActiveSubmissionId = (s: WorkspaceState) =>
  s.activeSubmissionId;

export const selectActiveTabByNode = (s: WorkspaceState) => s.activeTabByNode;
