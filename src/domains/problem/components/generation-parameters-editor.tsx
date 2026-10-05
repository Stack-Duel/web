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
import { useSetProblemGenerationParameters } from "../api/set-problem-generation-parameters";
import type { GenerationParameter } from "../models/generation-parameters";

const VALUE_TYPES = ["integer", "double", "boolean", "string", "integer_array"];

function emptyParameter(): GenerationParameter {
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

const toNumberOrNull = (value: string) =>
  value.trim() === "" ? null : Number(value);

type GenerationParametersEditorProps = {
  problemId: string;
  initialParameters: GenerationParameter[];
  initialOutputValueType: string | null;
  initialTargetCaseCount: number | null;
  initialSeed: number | null;
};

export default function GenerationParametersEditor({
  problemId,
  initialParameters,
  initialOutputValueType,
  initialTargetCaseCount,
  initialSeed,
}: Readonly<GenerationParametersEditorProps>) {
  const [parameters, setParameters] = useState<GenerationParameter[]>(
    initialParameters.length > 0 ? initialParameters : [emptyParameter()]
  );
  const [outputValueType, setOutputValueType] = useState(
    initialOutputValueType ?? "integer"
  );
  const [targetCaseCount, setTargetCaseCount] = useState(
    initialTargetCaseCount ?? 20
  );
  const [seed, setSeed] = useState(initialSeed ?? 12345);

  const { mutate: save, isPending } = useSetProblemGenerationParameters();

  const updateParameter = (
    index: number,
    patch: Partial<GenerationParameter>
  ) => {
    setParameters((params) =>
      params.map((p, i) => (i === index ? { ...p, ...patch } : p))
    );
  };

  const addParameter = () =>
    setParameters((params) => [...params, emptyParameter()]);

  const removeParameter = (index: number) =>
    setParameters((params) => params.filter((_, i) => i !== index));

  const handleSave = () => {
    if (parameters.some((p) => !p.name.trim())) {
      toast.error("Every parameter needs a name.");
      return;
    }

    save(
      { problemId, parameters, outputValueType, targetCaseCount, seed },
      {
        onSuccess: () => toast.success("Saved generation parameters"),
        onError: (error) =>
          toast.error(error.message || "Failed to save generation parameters"),
      }
    );
  };

  return (
    <div className="space-y-4">
      {parameters.map((parameter, index) => (
        <Card key={index}>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`param-name-${index}`}>Name</Label>
                <Input
                  id={`param-name-${index}`}
                  value={parameter.name}
                  placeholder="e.g. nums"
                  onChange={(e) =>
                    updateParameter(index, { name: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="w-40 space-y-1.5">
                <Label>Type</Label>
                <Select
                  value={parameter.valueType}
                  onValueChange={(value) =>
                    updateParameter(index, { valueType: value })
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeParameter(index)}
                disabled={isPending || parameters.length === 1}
                aria-label="Remove parameter"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="space-y-1.5">
                <Label htmlFor={`param-min-${index}`}>Min</Label>
                <Input
                  id={`param-min-${index}`}
                  type="number"
                  value={parameter.min ?? ""}
                  onChange={(e) =>
                    updateParameter(index, {
                      min: toNumberOrNull(e.target.value),
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`param-max-${index}`}>Max</Label>
                <Input
                  id={`param-max-${index}`}
                  type="number"
                  value={parameter.max ?? ""}
                  onChange={(e) =>
                    updateParameter(index, {
                      max: toNumberOrNull(e.target.value),
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`param-length-min-${index}`}>Length min</Label>
                <Input
                  id={`param-length-min-${index}`}
                  type="number"
                  value={parameter.lengthMin ?? ""}
                  onChange={(e) =>
                    updateParameter(index, {
                      lengthMin: toNumberOrNull(e.target.value),
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`param-length-max-${index}`}>Length max</Label>
                <Input
                  id={`param-length-max-${index}`}
                  type="number"
                  value={parameter.lengthMax ?? ""}
                  onChange={(e) =>
                    updateParameter(index, {
                      lengthMax: toNumberOrNull(e.target.value),
                    })
                  }
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`param-charset-${index}`}>Charset</Label>
                <Input
                  id={`param-charset-${index}`}
                  value={parameter.charset ?? ""}
                  onChange={(e) =>
                    updateParameter(index, {
                      charset: e.target.value || null,
                    })
                  }
                  disabled={isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="gap-1"
        onClick={addParameter}
        disabled={isPending}
      >
        <Plus size={16} /> Add parameter
      </Button>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Output type</Label>
          <Select
            value={outputValueType}
            onValueChange={setOutputValueType}
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
        <div className="space-y-1.5">
          <Label htmlFor="target-case-count">Target case count</Label>
          <Input
            id="target-case-count"
            type="number"
            min={1}
            value={targetCaseCount}
            onChange={(e) => setTargetCaseCount(Number(e.target.value))}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="generation-seed">Seed</Label>
          <Input
            id="generation-seed"
            type="number"
            value={seed}
            onChange={(e) => setSeed(Number(e.target.value))}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save generation parameters"}
        </Button>
      </div>
    </div>
  );
}
