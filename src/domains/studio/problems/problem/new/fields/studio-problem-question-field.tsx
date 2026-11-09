"use client";

import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemQuestionField() {
  const question = useNewStudioProblemStore((state) => state.question);
  const changeQuestion = useNewStudioProblemStore(
    (state) => state.changeQuestion
  );

  return (
    <div className="space-y-1.5">
      <Label htmlFor="new-problem-question">Question</Label>
      <Textarea
        id="new-problem-question"
        value={question}
        onChange={(e) => changeQuestion(e.target.value)}
        className="min-h-64 font-mono text-sm"
      />
    </div>
  );
}
