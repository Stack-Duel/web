"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import { createStore } from "zustand/vanilla";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  SampleTestCase,
  SampleTestCaseInput,
} from "../models/sample-test-case";

export function emptySampleTestCase(): SampleTestCase {
  return {
    name: "",
    inputs: [{ value: "", valueType: "integer" }],
    expectedOutputValue: "",
    expectedOutputValueType: "integer",
  };
}

function blankCaseShapedLike(template: SampleTestCase): SampleTestCase {
  return {
    name: "",
    inputs: template.inputs.map((input) => ({
      value: "",
      valueType: input.valueType,
    })),
    expectedOutputValue: "",
    expectedOutputValueType: template.expectedOutputValueType,
  };
}

let caseKeySeed = 0;
const nextCaseKey = () => `sample-test-case-${++caseKeySeed}`;

export interface SampleTestCasesState {
  order: string[];
  byId: Record<string, SampleTestCase>;
  changeCase: (id: string, patch: Partial<SampleTestCase>) => void;
  addCase: () => void;
  removeCase: (id: string) => void;
  reorderCases: (activeId: string, overId: string) => void;
  replaceAllCases: (testCases: SampleTestCase[]) => void;
  addInput: (id: string) => void;
  removeInput: (id: string, inputIndex: number) => void;
  changeInput: (
    id: string,
    inputIndex: number,
    patch: Partial<SampleTestCaseInput>
  ) => void;
}

export const createSampleTestCasesStore = (testCases: SampleTestCase[]) =>
  createStore<SampleTestCasesState>((set) => {
    const source = testCases.length > 0 ? testCases : [emptySampleTestCase()];
    const order: string[] = [];
    const byId: Record<string, SampleTestCase> = {};

    for (const testCase of source) {
      const id = nextCaseKey();
      order.push(id);
      byId[id] = testCase;
    }

    const patchCase = (
      state: SampleTestCasesState,
      id: string,
      patch: Partial<SampleTestCase>
    ) => ({
      byId: { ...state.byId, [id]: { ...state.byId[id], ...patch } },
    });

    return {
      order,
      byId,

      changeCase: (id, patch) => set((state) => patchCase(state, id, patch)),

      addCase: () =>
        set((state) => {
          const id = nextCaseKey();
          const previous = state.byId[state.order[state.order.length - 1]];

          return {
            order: [...state.order, id],
            byId: {
              ...state.byId,
              [id]: previous
                ? blankCaseShapedLike(previous)
                : emptySampleTestCase(),
            },
          };
        }),

      removeCase: (id) =>
        set((state) => ({
          order: state.order.filter((entry) => entry !== id),
        })),

      reorderCases: (activeId, overId) =>
        set((state) => ({
          order: arrayMove(
            state.order,
            state.order.indexOf(activeId),
            state.order.indexOf(overId)
          ),
        })),

      replaceAllCases: (testCases) =>
        set(() => {
          const source =
            testCases.length > 0 ? testCases : [emptySampleTestCase()];
          const nextOrder: string[] = [];
          const nextById: Record<string, SampleTestCase> = {};

          for (const testCase of source) {
            const id = nextCaseKey();
            nextOrder.push(id);
            nextById[id] = testCase;
          }

          return { order: nextOrder, byId: nextById };
        }),

      addInput: (id) =>
        set((state) =>
          patchCase(state, id, {
            inputs: [
              ...state.byId[id].inputs,
              { value: "", valueType: "integer" },
            ],
          })
        ),

      removeInput: (id, inputIndex) =>
        set((state) =>
          patchCase(state, id, {
            inputs: state.byId[id].inputs.filter(
              (_, index) => index !== inputIndex
            ),
          })
        ),

      changeInput: (id, inputIndex, patch) =>
        set((state) =>
          patchCase(state, id, {
            inputs: state.byId[id].inputs.map((input, index) =>
              index === inputIndex ? { ...input, ...patch } : input
            ),
          })
        ),
    };
  });

const SampleTestCasesStoreContext =
  createContext<StoreApi<SampleTestCasesState> | null>(null);

export function SampleTestCasesProvider({
  testCases,
  children,
}: Readonly<{ testCases: SampleTestCase[]; children: ReactNode }>) {
  const [store] = useState(() => createSampleTestCasesStore(testCases));

  return (
    <SampleTestCasesStoreContext.Provider value={store}>
      {children}
    </SampleTestCasesStoreContext.Provider>
  );
}

export function useSampleTestCasesStore<TSelected>(
  selector: (state: SampleTestCasesState) => TSelected
): TSelected {
  const store = useContext(SampleTestCasesStoreContext);

  if (!store) {
    throw new Error(
      "useSampleTestCasesStore must be used within SampleTestCasesProvider"
    );
  }

  return useStore(store, selector);
}

export function useSampleTestCasesStoreApi() {
  const store = useContext(SampleTestCasesStoreContext);

  if (!store) {
    throw new Error(
      "useSampleTestCasesStoreApi must be used within SampleTestCasesProvider"
    );
  }

  return store;
}

export const selectCaseOrder = (state: SampleTestCasesState) => state.order;

export const selectCase = (id: string) => (state: SampleTestCasesState) =>
  state.byId[id];
