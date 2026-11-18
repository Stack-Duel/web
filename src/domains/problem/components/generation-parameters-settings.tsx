"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { GENERATION_VALUE_TYPES } from "../models/generation-value-types";
import { useGenerationParametersStore } from "./generation-parameters-store";

export default function GenerationParametersSettings({
  isSaving,
}: Readonly<{ isSaving: boolean }>) {
  const outputValueType = useGenerationParametersStore(
    (state) => state.outputValueType
  );
  const targetCaseCount = useGenerationParametersStore(
    (state) => state.targetCaseCount
  );
  const seed = useGenerationParametersStore((state) => state.seed);
  const setOutputValueType = useGenerationParametersStore(
    (state) => state.setOutputValueType
  );
  const setTargetCaseCount = useGenerationParametersStore(
    (state) => state.setTargetCaseCount
  );
  const setSeed = useGenerationParametersStore((state) => state.setSeed);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="output-value-type">Output type</Label>
        <Select
          value={outputValueType}
          onValueChange={setOutputValueType}
          disabled={isSaving}
        >
          <SelectTrigger id="output-value-type">
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
      <div className="space-y-1.5">
        <Label htmlFor="target-case-count">Target case count</Label>
        <Input
          id="target-case-count"
          type="number"
          min={1}
          value={targetCaseCount}
          onChange={(e) => setTargetCaseCount(Number(e.target.value))}
          disabled={isSaving}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="generation-seed">Seed</Label>
        <Input
          id="generation-seed"
          type="number"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          disabled={isSaving}
        />
        <p className="text-sm text-muted-foreground">
          Used to predictably create random test cases. To generate different
          test cases use a different seed.
        </p>
      </div>
    </div>
  );
}
