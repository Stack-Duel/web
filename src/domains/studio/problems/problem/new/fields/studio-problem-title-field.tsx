"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useNewStudioProblemStore } from "../new-studio-problem-store";

export default function StudioProblemTitleField() {
  const title = useNewStudioProblemStore((state) => state.title);
  const changeTitle = useNewStudioProblemStore((state) => state.changeTitle);

  return (
    <div className="space-y-1.5">
      <Label htmlFor="new-problem-title">Title</Label>
      <Input
        id="new-problem-title"
        value={title}
        onChange={(e) => changeTitle(e.target.value)}
      />
    </div>
  );
}
