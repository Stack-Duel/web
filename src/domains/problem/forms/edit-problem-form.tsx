"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Markdown } from "@/shared/components/markdown/markdown";
import AdminProblemTagInput from "../components/admin-problem-tag-input";
import { useUpdateAdminProblem } from "../api/update-admin-problem";
import type {
  AdminProblemDetail,
  ProblemStatus,
} from "../models/admin-problem";

const validNextStatuses: Record<ProblemStatus, ProblemStatus[]> = {
  Draft: ["Draft", "Published", "Archived"],
  Published: ["Published", "Archived"],
  Archived: ["Archived"],
  // Not reachable — the detail page hides this form entirely while Pending.
  Pending: ["Pending"],
  Failed: ["Failed", "Archived"],
};

type EditProblemFormProps = {
  problem: AdminProblemDetail;
};

export default function EditProblemForm({
  problem,
}: Readonly<EditProblemFormProps>) {
  const [title, setTitle] = useState(problem.title);
  const [question, setQuestion] = useState(problem.question);
  const [difficulty, setDifficulty] = useState(problem.difficultyValue);
  const [timeLimitMs, setTimeLimitMs] = useState(problem.timeLimitMs);
  const [memoryLimitMb, setMemoryLimitMb] = useState(problem.memoryLimitMb);
  const [tags, setTags] = useState<string[]>(problem.tags);
  const [status, setStatus] = useState<ProblemStatus>(problem.status);

  const { mutate: updateProblem, isPending } = useUpdateAdminProblem();

  const handleSave = () => {
    updateProblem(
      {
        id: problem.id,
        title,
        question,
        difficulty,
        timeLimitMs,
        memoryLimitMb,
        tags,
        status,
      },
      {
        onSuccess: () => {
          toast.success("Problem updated");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update problem");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="problem-title">Title</Label>
        <Input
          id="problem-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="problem-question">Question</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <Textarea
            id="problem-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-96 font-mono text-sm"
          />
          <div className="min-h-96 overflow-y-auto rounded-md border p-4">
            <Markdown content={question} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="problem-difficulty">Difficulty</Label>
          <Input
            id="problem-difficulty"
            type="number"
            min={0}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="problem-time-limit">Time limit (ms)</Label>
          <Input
            id="problem-time-limit"
            type="number"
            min={100}
            max={10000}
            value={timeLimitMs}
            onChange={(e) => setTimeLimitMs(Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="problem-memory-limit">Memory limit (MB)</Label>
          <Input
            id="problem-memory-limit"
            type="number"
            min={16}
            max={512}
            value={memoryLimitMb}
            onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <AdminProblemTagInput tags={tags} onChange={setTags} />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as ProblemStatus)}
          disabled={validNextStatuses[problem.status].length === 1}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {validNextStatuses[problem.status].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {problem.status === "Archived" && (
          <p className="text-xs text-muted-foreground">
            Archived problems cannot change status.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
