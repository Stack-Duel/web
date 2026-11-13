"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  selectEstimatedDifficulty,
  useNewStudioProblemStore,
} from "../new-studio-problem-store";

export default function StudioProblemDifficultyField() {
  const estimatedDifficulty = useNewStudioProblemStore(
    selectEstimatedDifficulty
  );
  const changeEstimatedDifficulty = useNewStudioProblemStore(
    (state) => state.changeEstimatedDifficulty
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor="new-problem-difficulty">Difficulty</Label>
      <Input
        id="new-problem-difficulty"
        type="number"
        min={0}
        value={estimatedDifficulty}
        onChange={(e) => changeEstimatedDifficulty(Number(e.target.value))}
      />
    </div>
  );
}
