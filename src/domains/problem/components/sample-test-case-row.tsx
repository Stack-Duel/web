"use client";

import { memo } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { GENERATION_VALUE_TYPES } from "../models/generation-value-types";
import { selectCase, useSampleTestCasesStore } from "./sample-test-cases-store";

export type SampleTestCaseRowProps = {
  id: string;
  position: number;
  isSaving: boolean;
  canRemove: boolean;
};

function SampleTestCaseRow({
  id,
  position,
  isSaving,
  canRemove,
}: Readonly<SampleTestCaseRowProps>) {
  const testCase = useSampleTestCasesStore(selectCase(id));
  const changeCase = useSampleTestCasesStore((state) => state.changeCase);
  const removeCase = useSampleTestCasesStore((state) => state.removeCase);
  const addInput = useSampleTestCasesStore((state) => state.addInput);
  const removeInput = useSampleTestCasesStore((state) => state.removeInput);
  const changeInput = useSampleTestCasesStore((state) => state.changeInput);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-80 shadow-lg")}
    >
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="mt-6 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label={`Reorder ${testCase.name || `case ${position}`}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`case-name-${id}`}>Name</Label>
            <Input
              id={`case-name-${id}`}
              value={testCase.name ?? ""}
              placeholder={`Example ${position}`}
              onChange={(e) => changeCase(id, { name: e.target.value })}
              disabled={isSaving}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="mt-6"
            onClick={() => removeCase(id)}
            disabled={isSaving || !canRemove}
            aria-label="Remove test case"
          >
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Inputs</Label>
          {testCase.inputs.map((input, inputIndex) => (
            <div key={inputIndex} className="flex items-center gap-2">
              <Input
                aria-label={`Input ${inputIndex + 1} value`}
                value={input.value}
                placeholder="Value"
                onChange={(e) =>
                  changeInput(id, inputIndex, { value: e.target.value })
                }
                disabled={isSaving}
              />
              <Select
                value={input.valueType}
                onValueChange={(valueType) =>
                  changeInput(id, inputIndex, { valueType })
                }
                disabled={isSaving}
              >
                <SelectTrigger
                  className="w-40"
                  aria-label={`Input ${inputIndex + 1} type`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENERATION_VALUE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeInput(id, inputIndex)}
                disabled={isSaving || testCase.inputs.length === 1}
                aria-label="Remove input"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => addInput(id)}
            disabled={isSaving}
          >
            <Plus size={14} /> Add input
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`case-output-${id}`}>Expected output</Label>
            <Input
              id={`case-output-${id}`}
              value={testCase.expectedOutputValue}
              onChange={(e) =>
                changeCase(id, { expectedOutputValue: e.target.value })
              }
              disabled={isSaving}
            />
          </div>
          <div className="w-40 space-y-1.5">
            <Label htmlFor={`case-output-type-${id}`}>Type</Label>
            <Select
              value={testCase.expectedOutputValueType}
              onValueChange={(expectedOutputValueType) =>
                changeCase(id, { expectedOutputValueType })
              }
              disabled={isSaving}
            >
              <SelectTrigger id={`case-output-type-${id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_VALUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(SampleTestCaseRow);
