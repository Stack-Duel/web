"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemTimeLimitField() {
  const timeLimitMs = useNewStudioProblemStore((state) => state.timeLimitMs);
  const changeTimeLimitMs = useNewStudioProblemStore(
    (state) => state.changeTimeLimitMs
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor="new-problem-time-limit">Time limit (ms)</Label>
      <Input
        id="new-problem-time-limit"
        type="number"
        min={100}
        max={10000}
        value={timeLimitMs}
        onChange={(e) => changeTimeLimitMs(Number(e.target.value))}
      />
    </div>
  );
}
