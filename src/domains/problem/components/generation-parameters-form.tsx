"use client";

import { useCallback, useId, useMemo } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/shared/components/ui/button";
import GenerationParameterRow from "./generation-parameter-row";
import GenerationParametersSettings from "./generation-parameters-settings";
import {
  GenerationParametersProvider,
  selectParameterOrder,
  useGenerationParametersStore,
  useGenerationParametersStoreApi,
} from "./generation-parameters-store";
import type { GenerationParameter } from "../models/generation-parameters";
import JsonDataDialog from "./json-data-dialog";
import {
  generationParametersJsonSchema,
  parseOrThrow,
} from "../models/problem-json-schemas";

export type GenerationParametersFormValues = {
  parameters: GenerationParameter[];
  outputValueType: string;
  targetCaseCount: number;
  seed: number;
};

type GenerationParametersFormProps = {
  initialParameters: GenerationParameter[];
  initialOutputValueType: string | null;
  initialTargetCaseCount: number | null;
  initialSeed: number | null;
  isSaving: boolean;
  saveLabel?: string;
  onSave: (values: GenerationParametersFormValues) => void;
};

function GenerationParametersFormBody({
  isSaving,
  saveLabel = "Save generation parameters",
  onSave,
}: Readonly<
  Pick<GenerationParametersFormProps, "isSaving" | "saveLabel" | "onSave">
>) {
  const store = useGenerationParametersStoreApi();
  const parameterOrder = useGenerationParametersStore(selectParameterOrder);

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const dragModifiers = useMemo(() => [restrictToVerticalAxis], []);

  const handleParameterChange = useCallback(
    (id: string, patch: Partial<GenerationParameter>) =>
      store.getState().changeParameter(id, patch),
    [store]
  );

  const handleParameterRemove = useCallback(
    (id: string) => store.getState().removeParameter(id),
    [store]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      store
        .getState()
        .reorderParameters(active.id as string, over.id as string);
    },
    [store]
  );

  const handleSave = () => {
    const state = store.getState();
    const parameters = state.order.map((id) => state.byId[id]);

    if (parameters.some((parameter) => !parameter.name.trim())) {
      toast.error("Every parameter needs a name.");
      return;
    }

    onSave({
      parameters,
      outputValueType: state.outputValueType,
      targetCaseCount: state.targetCaseCount,
      seed: state.seed,
    });
  };

  return (
    <div className="space-y-4">
      <DndContext
        id={sortableId}
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={dragModifiers}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={parameterOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {parameterOrder.map((id) => (
              <GenerationParameterRow
                key={id}
                id={id}
                isSaving={isSaving}
                canRemove={parameterOrder.length > 1}
                onChange={handleParameterChange}
                onRemove={handleParameterRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="gap-1"
          onClick={() => store.getState().addParameter()}
          disabled={isSaving}
        >
          <Plus size={16} /> Add parameter
        </Button>
        <JsonDataDialog
          title="Generation parameters JSON"
          description="Edit the parameters, output type, case count and seed as JSON, then apply them to the form. Nothing is saved until you press save."
          isDisabled={isSaving}
          getCurrentJson={() => {
            const state = store.getState();
            return {
              parameters: state.order.map((id) => state.byId[id]),
              outputValueType: state.outputValueType,
              targetCaseCount: state.targetCaseCount,
              seed: state.seed,
            };
          }}
          onApply={(parsed) =>
            store
              .getState()
              .replaceAll(parseOrThrow(generationParametersJsonSchema, parsed))
          }
        />
      </div>

      <GenerationParametersSettings isSaving={isSaving} />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export default function GenerationParametersForm({
  initialParameters,
  initialOutputValueType,
  initialTargetCaseCount,
  initialSeed,
  ...bodyProps
}: Readonly<GenerationParametersFormProps>) {
  return (
    <GenerationParametersProvider
      init={{
        parameters: initialParameters,
        outputValueType: initialOutputValueType,
        targetCaseCount: initialTargetCaseCount,
        seed: initialSeed,
      }}
    >
      <GenerationParametersFormBody {...bodyProps} />
    </GenerationParametersProvider>
  );
}
