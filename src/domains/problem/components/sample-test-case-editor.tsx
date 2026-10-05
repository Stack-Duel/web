"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { useSetProblemSampleTestCases } from "../api/set-problem-sample-test-cases";
import type { SampleTestCase } from "../models/sample-test-case";

const VALUE_TYPES = ["integer", "double", "boolean", "string", "integer_array"];

function emptyTestCase(): SampleTestCase {
  return {
    name: "",
    inputs: [{ value: "", valueType: "integer" }],
    expectedOutputValue: "",
    expectedOutputValueType: "integer",
  };
}

type SampleTestCaseEditorProps = {
  problemId: string;
  initialTestCases: SampleTestCase[];
};

export default function SampleTestCaseEditor({
  problemId,
  initialTestCases,
}: Readonly<SampleTestCaseEditorProps>) {
  const [testCases, setTestCases] = useState<SampleTestCase[]>(
    initialTestCases.length > 0 ? initialTestCases : [emptyTestCase()]
  );

  const { mutate: save, isPending } = useSetProblemSampleTestCases();

  const updateCase = (index: number, patch: Partial<SampleTestCase>) => {
    setTestCases((cases) =>
      cases.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const addCase = () => setTestCases((cases) => [...cases, emptyTestCase()]);

  const removeCase = (index: number) =>
    setTestCases((cases) => cases.filter((_, i) => i !== index));

  const addInput = (caseIndex: number) => {
    setTestCases((cases) =>
      cases.map((c, i) =>
        i === caseIndex
          ? { ...c, inputs: [...c.inputs, { value: "", valueType: "integer" }] }
          : c
      )
    );
  };

  const removeInput = (caseIndex: number, inputIndex: number) => {
    setTestCases((cases) =>
      cases.map((c, i) =>
        i === caseIndex
          ? { ...c, inputs: c.inputs.filter((_, j) => j !== inputIndex) }
          : c
      )
    );
  };

  const updateInput = (
    caseIndex: number,
    inputIndex: number,
    patch: Partial<{ value: string; valueType: string }>
  ) => {
    setTestCases((cases) =>
      cases.map((c, i) =>
        i === caseIndex
          ? {
              ...c,
              inputs: c.inputs.map((input, j) =>
                j === inputIndex ? { ...input, ...patch } : input
              ),
            }
          : c
      )
    );
  };

  const handleSave = () => {
    if (testCases.some((c) => c.inputs.some((input) => !input.value.trim()))) {
      toast.error("Every input needs a value.");
      return;
    }
    if (testCases.some((c) => !c.expectedOutputValue.trim())) {
      toast.error("Every test case needs an expected output.");
      return;
    }

    save(
      { problemId, testCases },
      {
        onSuccess: () => toast.success("Saved sample test cases"),
        onError: (error) =>
          toast.error(error.message || "Failed to save sample test cases"),
      }
    );
  };

  return (
    <div className="space-y-4">
      {testCases.map((testCase, caseIndex) => (
        <Card key={caseIndex}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`case-name-${caseIndex}`}>Name</Label>
                <Input
                  id={`case-name-${caseIndex}`}
                  value={testCase.name ?? ""}
                  placeholder={`Example ${caseIndex + 1}`}
                  onChange={(e) =>
                    updateCase(caseIndex, { name: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => removeCase(caseIndex)}
                disabled={isPending || testCases.length === 1}
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
                    value={input.value}
                    placeholder="Value"
                    onChange={(e) =>
                      updateInput(caseIndex, inputIndex, {
                        value: e.target.value,
                      })
                    }
                    disabled={isPending}
                  />
                  <Select
                    value={input.valueType}
                    onValueChange={(value) =>
                      updateInput(caseIndex, inputIndex, { valueType: value })
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALUE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeInput(caseIndex, inputIndex)}
                    disabled={isPending || testCase.inputs.length === 1}
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
                onClick={() => addInput(caseIndex)}
                disabled={isPending}
              >
                <Plus size={14} /> Add input
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`case-output-${caseIndex}`}>
                  Expected output
                </Label>
                <Input
                  id={`case-output-${caseIndex}`}
                  value={testCase.expectedOutputValue}
                  onChange={(e) =>
                    updateCase(caseIndex, {
                      expectedOutputValue: e.target.value,
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={testCase.expectedOutputValueType}
                  onValueChange={(value) =>
                    updateCase(caseIndex, { expectedOutputValueType: value })
                  }
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VALUE_TYPES.map((type) => (
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
      ))}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="gap-1"
          onClick={addCase}
          disabled={isPending}
        >
          <Plus size={16} /> Add test case
        </Button>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save sample test cases"}
        </Button>
      </div>
    </div>
  );
}
