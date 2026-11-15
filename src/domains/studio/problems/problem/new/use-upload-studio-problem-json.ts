"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AnyFormApi } from "@tanstack/react-form";
import type { Track } from "@/domains/game/models/track";
import {
  newStudioProblemSchema,
  TITLE_MIN_LENGTH,
  TITLE_MAX_LENGTH,
  QUESTION_MIN_LENGTH,
  QUESTION_MAX_LENGTH,
  DIFFICULTY_MIN,
  DIFFICULTY_MAX,
  TIME_LIMIT_MIN_MS,
  TIME_LIMIT_MAX_MS,
  MEMORY_LIMIT_MIN_MB,
  MEMORY_LIMIT_MAX_MB,
  MIN_TAG_COUNT,
  MAX_TAG_COUNT,
} from "./new-studio-problem-schema";
import { formatZodError } from "@/domains/problem/schemas/format-zod-error";
import { normalizeText } from "@/shared/utils/normalize-text";
import { useNewStudioProblemStore } from "./new-studio-problem-store";

export function buildStudioProblemJsonPromptTemplate(
  availableTracks: Track[]
): string {
  const trackIds = availableTracks.map((track) => track.id).join(" | ");

  return `{
  // ${TITLE_MIN_LENGTH}-${TITLE_MAX_LENGTH} characters
  "title": "string",
  // ${QUESTION_MIN_LENGTH}-${QUESTION_MAX_LENGTH} characters, markdown supported
  "question": "string",
  // ${DIFFICULTY_MIN}-${DIFFICULTY_MAX}
  "estimatedDifficulty": 500,
  // ${TIME_LIMIT_MIN_MS}-${TIME_LIMIT_MAX_MS}
  "timeLimitMs": 1000,
  // ${MEMORY_LIMIT_MIN_MB}-${MEMORY_LIMIT_MAX_MB}
  "memoryLimitMB": 64,
  // one of: ${trackIds || "(no tracks available)"}
  "trackId": "string",
  // ${MIN_TAG_COUNT}-${MAX_TAG_COUNT} tags, lowercase letters/numbers/hyphens only
  "tags": ["string"]
}`;
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
