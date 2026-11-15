import { describe, expect, it } from "vitest";
import { buildStudioProblemJsonPromptTemplate } from "./use-upload-studio-problem-json";
import { newStudioProblemSchema } from "./new-studio-problem-schema";
import type { Track } from "@/domains/game/models/track";

describe("buildStudioProblemJsonPromptTemplate", () => {
  it("produces parseable JSON with a schema-valid example and an escaped track ID", () => {
    const trackId = 'track-"quoted"\\id';
    const parsed = JSON.parse(
      buildStudioProblemJsonPromptTemplate([{ id: trackId } as Track])
    );
    expect(parsed.trackId).toBe(trackId);
    expect(newStudioProblemSchema.safeParse(parsed).success).toBe(true);
  });

  it("produces parseable JSON when no tracks are available", () => {
    expect(JSON.parse(buildStudioProblemJsonPromptTemplate([])).trackId).toBe(
      "string"
    );
  });
});
