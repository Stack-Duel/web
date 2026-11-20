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
import SampleTestCaseRow from "./sample-test-case-row";
import {
  SampleTestCasesProvider,
  selectCaseOrder,
  useSampleTestCasesStore,
  useSampleTestCasesStoreApi,
} from "./sample-test-cases-store";
import type { SampleTestCase } from "../models/sample-test-case";
import JsonDataDialog from "./json-data-dialog";
import {
  parseOrThrow,
  sampleTestCasesJsonSchema,
} from "../models/problem-json-schemas";

export type SampleTestCaseFormProps = {
  initialTestCases: SampleTestCase[];
  isSaving: boolean;
  saveLabel?: string;
  onSave: (testCases: SampleTestCase[]) => void;
};

function SampleTestCaseFormBody({
  isSaving,
  saveLabel = "Save sample test cases",
  onSave,
}: Readonly<Omit<SampleTestCaseFormProps, "initialTestCases">>) {
  const store = useSampleTestCasesStoreApi();
  const caseOrder = useSampleTestCasesStore(selectCaseOrder);

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const dragModifiers = useMemo(() => [restrictToVerticalAxis], []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      store.getState().reorderCases(active.id as string, over.id as string);
    },
    [store]
  );

  const handleSave = () => {
    const state = store.getState();
    const testCases = state.order.map((id) => state.byId[id]);

    if (
      testCases.some((testCase) =>
        testCase.inputs.some((input) => !input.value.trim())
      )
    ) {
      toast.error("Every input needs a value.");
      return;
    }
    if (testCases.some((testCase) => !testCase.expectedOutputValue.trim())) {
      toast.error("Every test case needs an expected output.");
      return;
    }

    onSave(testCases);
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
          items={caseOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {caseOrder.map((id, index) => (
              <SampleTestCaseRow
                key={id}
                id={id}
                position={index + 1}
                isSaving={isSaving}
                canRemove={caseOrder.length > 1}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => store.getState().addCase()}
            disabled={isSaving}
          >
            <Plus size={16} /> Add test case
          </Button>
          <JsonDataDialog
            title="Sample cases JSON"
            description="Edit the whole set as JSON, then apply it to the form. Nothing is saved until you press save."
            isDisabled={isSaving}
            getCurrentJson={() => {
              const state = store.getState();
              return state.order.map((id) => state.byId[id]);
            }}
            onApply={(parsed) =>
              store
                .getState()
                .replaceAllCases(
                  parseOrThrow(sampleTestCasesJsonSchema, parsed)
                )
            }
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : saveLabel}
        </Button>
      </div>
    </div>
  );
}

export default function SampleTestCaseForm({
  initialTestCases,
  ...bodyProps
}: Readonly<SampleTestCaseFormProps>) {
  return (
    <SampleTestCasesProvider testCases={initialTestCases}>
      <SampleTestCaseFormBody {...bodyProps} />
    </SampleTestCasesProvider>
  );
}
