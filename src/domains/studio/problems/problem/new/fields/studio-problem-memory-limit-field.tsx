"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  selectMemoryLimitMb,
  useNewStudioProblemStore,
} from "../new-studio-problem-store";

export default function StudioProblemMemoryLimitField() {
  const memoryLimitMB = useNewStudioProblemStore(selectMemoryLimitMb);
  const changeMemoryLimitMB = useNewStudioProblemStore(
    (state) => state.changeMemoryLimitMB
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor="new-problem-memory-limit">Memory limit (MB)</Label>
      <Input
        id="new-problem-memory-limit"
        type="number"
        min={16}
        max={512}
        value={memoryLimitMB}
        onChange={(e) => changeMemoryLimitMB(Number(e.target.value))}
      />
    </div>
  );
}
