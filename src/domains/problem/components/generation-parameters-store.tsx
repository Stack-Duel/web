"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore, type StoreApi } from "zustand";
import { createStore } from "zustand/vanilla";
import { arrayMove } from "@dnd-kit/sortable";
import type { GenerationParameter } from "../models/generation-parameters";
import { constraintsForValueType } from "../models/generation-value-types";

export function emptyGenerationParameter(): GenerationParameter {
  return {
    name: "",
    valueType: "integer",
    min: null,
    max: null,
    lengthMin: null,
    lengthMax: null,
    charset: null,
  };
}

function clearUnsupportedConstraints(
  parameter: GenerationParameter
): GenerationParameter {
  const supported = constraintsForValueType(parameter.valueType);

  return {
    ...parameter,
    min: supported.includes("min") ? parameter.min : null,
    max: supported.includes("max") ? parameter.max : null,
    lengthMin: supported.includes("lengthMin") ? parameter.lengthMin : null,
    lengthMax: supported.includes("lengthMax") ? parameter.lengthMax : null,
    charset: supported.includes("charset") ? parameter.charset : null,
  };
}

let parameterKeySeed = 0;
const nextParameterKey = () => `generation-parameter-${++parameterKeySeed}`;

export interface GenerationParametersState {
  order: string[];
  byId: Record<string, GenerationParameter>;
  outputValueType: string;
  targetCaseCount: number;
  seed: number;
  changeParameter: (id: string, patch: Partial<GenerationParameter>) => void;
  addParameter: () => void;
  removeParameter: (id: string) => void;
  reorderParameters: (activeId: string, overId: string) => void;
  replaceAll: (values: {
    parameters: GenerationParameter[];
    outputValueType: string;
    targetCaseCount: number;
    seed: number;
  }) => void;
  setOutputValueType: (outputValueType: string) => void;
  setTargetCaseCount: (targetCaseCount: number) => void;
  setSeed: (seed: number) => void;
}

export type GenerationParametersInit = {
  parameters: GenerationParameter[];
  outputValueType: string | null;
  targetCaseCount: number | null;
  seed: number | null;
};

export const createGenerationParametersStore = (
  init: GenerationParametersInit
) =>
  createStore<GenerationParametersState>((set) => {
    const source =
      init.parameters.length > 0
        ? init.parameters
        : [emptyGenerationParameter()];
    const order: string[] = [];
    const byId: Record<string, GenerationParameter> = {};

    for (const parameter of source) {
      const id = nextParameterKey();
      order.push(id);
      byId[id] = parameter;
    }

    return {
      order,
      byId,
      outputValueType: init.outputValueType ?? "integer",
      targetCaseCount: init.targetCaseCount ?? 20,
      seed: init.seed ?? 12345,

      changeParameter: (id, patch) =>
        set((state) => ({
          byId: {
            ...state.byId,
            [id]: clearUnsupportedConstraints({ ...state.byId[id], ...patch }),
          },
        })),

      addParameter: () =>
        set((state) => {
          const id = nextParameterKey();
          return {
            order: [...state.order, id],
            byId: { ...state.byId, [id]: emptyGenerationParameter() },
          };
        }),

      removeParameter: (id) =>
        set((state) => ({
          order: state.order.filter((entry) => entry !== id),
        })),

      reorderParameters: (activeId, overId) =>
        set((state) => ({
          order: arrayMove(
            state.order,
            state.order.indexOf(activeId),
            state.order.indexOf(overId)
          ),
        })),

      replaceAll: (values) =>
        set(() => {
          const source =
            values.parameters.length > 0
              ? values.parameters
              : [emptyGenerationParameter()];
          const nextOrder: string[] = [];
          const nextById: Record<string, GenerationParameter> = {};

          for (const parameter of source) {
            const id = nextParameterKey();
            nextOrder.push(id);
            nextById[id] = parameter;
          }

          return {
            order: nextOrder,
            byId: nextById,
            outputValueType: values.outputValueType,
            targetCaseCount: values.targetCaseCount,
            seed: values.seed,
          };
        }),

      setOutputValueType: (outputValueType) => set({ outputValueType }),
      setTargetCaseCount: (targetCaseCount) => set({ targetCaseCount }),
      setSeed: (seed) => set({ seed }),
    };
  });

const GenerationParametersStoreContext =
  createContext<StoreApi<GenerationParametersState> | null>(null);

export function GenerationParametersProvider({
  init,
  children,
}: Readonly<{ init: GenerationParametersInit; children: ReactNode }>) {
  const [store] = useState(() => createGenerationParametersStore(init));

  return (
    <GenerationParametersStoreContext.Provider value={store}>
      {children}
    </GenerationParametersStoreContext.Provider>
  );
}

export function useGenerationParametersStore<TSelected>(
  selector: (state: GenerationParametersState) => TSelected
): TSelected {
  const store = useContext(GenerationParametersStoreContext);

  if (!store) {
    throw new Error(
      "useGenerationParametersStore must be used within GenerationParametersProvider"
    );
  }

  return useStore(store, selector);
}

export function useGenerationParametersStoreApi() {
  const store = useContext(GenerationParametersStoreContext);

  if (!store) {
    throw new Error(
      "useGenerationParametersStoreApi must be used within GenerationParametersProvider"
    );
  }

  return store;
}

export const selectParameterOrder = (state: GenerationParametersState) =>
  state.order;

export const selectParameter =
  (id: string) => (state: GenerationParametersState) =>
    state.byId[id];
