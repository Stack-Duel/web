"use client";

import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useSubmitProblemForValidation } from "../api/submit-problem-for-validation";

type SubmitForValidationButtonProps = {
  problemId: string;
};

export default function SubmitForValidationButton({
  problemId,
}: Readonly<SubmitForValidationButtonProps>) {
  const { mutate: submit, isPending } = useSubmitProblemForValidation();

  const handleSubmit = () => {
    submit(
      { problemId },
      {
        onSuccess: () => {
          toast.success("Submitted for validation");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to submit for validation");
        },
      }
    );
  };

  return (
    <Button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Submitting..." : "Submit for validation"}
    </Button>
  );
}
