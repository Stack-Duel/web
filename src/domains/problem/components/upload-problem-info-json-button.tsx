"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import JsonUploadDialog from "./json-upload-dialog";
import { useCreateProblemDraft } from "../api/create-problem-draft";
import { problemInfoUploadSchema } from "../schemas/problem-info-upload-schema";
import { formatZodError } from "../schemas/format-zod-error";
import { routerConfig } from "@/shared/router-config";

const exampleJson = JSON.stringify(
  {
    title: "Two Sum",
    question:
      "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    difficulty: 200,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    tags: ["array", "hash-map"],
    trackId: "00000000-0000-0000-0000-000000000000",
  },
  null,
  2
);

export default function UploadProblemInfoJsonButton() {
  const router = useRouter();
  const { mutateAsync: createDraft } = useCreateProblemDraft();

  const handleSubmit = async (parsed: unknown) => {
    const result = problemInfoUploadSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const id = await createDraft(result.data);
    toast.success("Draft created");
    router.push(routerConfig.adminProblemDetail.execute({ id }));
  };

  return (
    <JsonUploadDialog
      triggerLabel="Upload JSON"
      title="Upload problem information"
      description="Paste or upload JSON describing a new problem's title, question, difficulty, limits, tags, and track. trackId must be an existing track's id — see /admin (Tracks) for valid ids."
      exampleJson={exampleJson}
      onSubmit={handleSubmit}
    />
  );
}
