"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AnyFormApi } from "@tanstack/react-form";
import type { Track } from "@/domains/game/models/track";
import { newStudioProblemSchema } from "./new-studio-problem-schema";
import { formatZodError } from "@/domains/problem/schemas/format-zod-error";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useNewStudioProblemStore } from "./new-studio-problem-store";

export function buildStudioProblemJsonPromptTemplate(
  availableTracks: Track[]
): string {
  return JSON.stringify(
    {
      title: "Problem title",
      question: "Describe the problem, its inputs, outputs, and examples here.",
      estimatedDifficulty: 500,
      timeLimitMs: 1000,
      memoryLimitMB: 64,
      trackId: availableTracks[0]?.id ?? "string",
      tags: ["string"],
    },
    null,
    2
  );
}

type UseUploadStudioProblemJsonArgs = {
  form: AnyFormApi;
  availableTracks: Track[];
  onUploaded: () => void;
};

export function useUploadStudioProblemJson({
  form,
  availableTracks,
  onUploaded,
}: UseUploadStudioProblemJsonArgs) {
  const [text, setText] = useState("");
  const changeTitle = useNewStudioProblemStore((state) => state.changeTitle);
  const changeQuestion = useNewStudioProblemStore(
    (state) => state.changeQuestion
  );
  const changeEstimatedDifficulty = useNewStudioProblemStore(
    (state) => state.changeEstimatedDifficulty
  );
  const changeTimeLimitMs = useNewStudioProblemStore(
    (state) => state.changeTimeLimitMs
  );
  const changeMemoryLimitMB = useNewStudioProblemStore(
    (state) => state.changeMemoryLimitMB
  );
  const setTrackId = useNewStudioProblemStore((state) => state.setTrackId);
  const clearTags = useNewStudioProblemStore((state) => state.clearTags);
  const addTag = useNewStudioProblemStore((state) => state.addTag);

  const promptTemplate = buildStudioProblemJsonPromptTemplate(availableTracks);

  const handleUpload = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      toast.error("That's not valid JSON.");
      return;
    }

    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "tags" in parsed &&
      Array.isArray((parsed as { tags: unknown }).tags)
    ) {
      const rawTags = (parsed as { tags: unknown[] }).tags;
      (parsed as { tags: unknown }).tags = [
        ...new Set(
          rawTags
            .filter((tag): tag is string => typeof tag === "string")
            .map((tag) => normalizeText(tag))
            .filter(Boolean)
        ),
      ];
    }

    const result = newStudioProblemSchema.safeParse(parsed);
    if (!result.success) {
      toast.error(formatZodError(result.error));
      return;
    }

    const draft = result.data;

    if (!availableTracks.some((track) => track.id === draft.trackId)) {
      toast.error(
        "trackId must match one of the available tracks listed above."
      );
      return;
    }

    form.setFieldValue("title", draft.title);
    form.setFieldValue("question", draft.question);
    form.setFieldValue("estimatedDifficulty", draft.estimatedDifficulty);
    form.setFieldValue("timeLimitMs", draft.timeLimitMs);
    form.setFieldValue("memoryLimitMB", draft.memoryLimitMB);
    form.setFieldValue("trackId", draft.trackId);
    form.setFieldValue("tags", draft.tags);

    changeTitle(draft.title);
    changeQuestion(draft.question);
    changeEstimatedDifficulty(draft.estimatedDifficulty);
    changeTimeLimitMs(draft.timeLimitMs);
    changeMemoryLimitMB(draft.memoryLimitMB);
    setTrackId(draft.trackId);
    clearTags();
    draft.tags.forEach(addTag);

    toast.success("Problem details loaded from JSON");
    setText("");
    onUploaded();
  };

  return { text, setText, promptTemplate, handleUpload };
}
