import { z } from "zod";

// Message max length mirrors Algowars.Domain.Feedback.ValueObjects.FeedbackMessage (2000 chars).
export const submitFeedbackSchema = z
  .object({
    type: z.enum(["Bug", "FeatureRequest", "Question", "General"]),
    message: z.string().max(2000, "Feedback must be at most 2000 characters"),
    rating: z.number().min(1).max(5).nullable(),
  })
  .refine((data) => data.rating !== null || data.message.trim().length > 0, {
    message: "Please describe your feedback or give a star rating",
    path: ["message"],
  });
