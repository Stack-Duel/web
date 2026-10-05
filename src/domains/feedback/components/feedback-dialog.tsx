"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { submitFeedbackSchema } from "../schemas/submit-feedback-schema";
import { useSubmitFeedback } from "../api/submit-feedback";
import { FeedbackRatingInput } from "./feedback-rating-input";
import type { FeedbackContextType, FeedbackType } from "../models/feedback";

const FEEDBACK_TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "Bug", label: "Bug report" },
  { value: "FeatureRequest", label: "Feature request" },
  { value: "Question", label: "Question" },
  { value: "General", label: "General feedback" },
];

export type FeedbackDialogContext = {
  type: Extract<FeedbackContextType, "Problem" | "Game" | "Submission">;
  entityId: string;
};

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: FeedbackDialogContext;
  description?: string;
};

export function FeedbackDialog({
  open,
  onOpenChange,
  context,
  description = "Report a bug, request a feature, or just tell us what's on your mind.",
}: Readonly<FeedbackDialogProps>) {
  const mutation = useSubmitFeedback({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Thanks for the feedback!");
        onOpenChange(false);
        form.reset();
      },
      onError: () => {
        toast.error("Couldn't send feedback. Please try again.");
      },
    },
  });

  const form = useForm({
    defaultValues: {
      type: "General" as FeedbackType,
      message: "",
      rating: null as number | null,
    },
    validators: {
      onSubmit: submitFeedbackSchema,
    },
    onSubmit: async ({ value }) => {
      const message =
        value.message.trim().length > 0
          ? value.message
          : "⭐".repeat(value.rating ?? 0);

      mutation.mutate({
        type: value.type,
        message,
        rating: value.rating,
        contextType: context?.type ?? "None",
        contextEntityId: context?.entityId ?? null,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Give feedback</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <form.Field name="type">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Type</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(value as FeedbackType)
                    }
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="rating">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Rate your experience (optional)
                  </FieldLabel>
                  <FeedbackRatingInput
                    value={field.state.value}
                    onChange={field.handleChange}
                  />
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.rating}>
              {(rating) => {
                const messageOptional = rating !== null;

                return (
                  <form.Field name="message">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            Message {messageOptional ? "(optional)" : ""}
                          </FieldLabel>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="What's going on?"
                            rows={4}
                            aria-invalid={isInvalid}
                          />
                          {isInvalid ? (
                            <FieldError errors={field.state.meta.errors} />
                          ) : (
                            <FieldDescription>
                              Required unless you give a star rating.
                            </FieldDescription>
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                );
              }}
            </form.Subscribe>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
