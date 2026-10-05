"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { routerConfig } from "@/shared/router-config";
import { useTracks } from "@/domains/game/api/use-tracks";
import AdminProblemTagInput from "../components/admin-problem-tag-input";
import { useCreateProblemDraft } from "../api/create-problem-draft";

export default function CreateProblemForm() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState(500);
  const [timeLimitMs, setTimeLimitMs] = useState(1000);
  const [memoryLimitMb, setMemoryLimitMb] = useState(64);
  const [tags, setTags] = useState<string[]>([]);
  const [trackId, setTrackId] = useState<string>("");

  const { data: tracks } = useTracks();
  const { mutate: createDraft, isPending } = useCreateProblemDraft();

  const handleCreate = () => {
    if (!title.trim() || !question.trim()) {
      toast.error("Title and question are required.");
      return;
    }

    if (!trackId) {
      toast.error("Track is required.");
      return;
    }

    createDraft(
      {
        title,
        question,
        difficulty,
        timeLimitMs,
        memoryLimitMb,
        tags,
        trackId,
      },
      {
        onSuccess: (id) => {
          toast.success("Draft created");
          router.push(routerConfig.adminProblemDetail.execute({ id }));
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create problem draft");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-problem-title">Title</Label>
        <Input
          id="new-problem-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-problem-question">Question</Label>
        <Textarea
          id="new-problem-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-64 font-mono text-sm"
          disabled={isPending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-problem-difficulty">Difficulty</Label>
          <Input
            id="new-problem-difficulty"
            type="number"
            min={0}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-problem-time-limit">Time limit (ms)</Label>
          <Input
            id="new-problem-time-limit"
            type="number"
            min={100}
            max={10000}
            value={timeLimitMs}
            onChange={(e) => setTimeLimitMs(Number(e.target.value))}
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-problem-memory-limit">Memory limit (MB)</Label>
          <Input
            id="new-problem-memory-limit"
            type="number"
            min={16}
            max={512}
            value={memoryLimitMb}
            onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Track</Label>
        <Select value={trackId} onValueChange={setTrackId} disabled={isPending}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a track" />
          </SelectTrigger>
          <SelectContent>
            {tracks?.map((track) => (
              <SelectItem key={track.id} value={track.id}>
                {track.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Tags</Label>
        <AdminProblemTagInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleCreate} disabled={isPending}>
          {isPending ? "Creating..." : "Create draft"}
        </Button>
      </div>
    </div>
  );
}
