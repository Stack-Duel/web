"use client";

import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useSubmitStudioProblemForValidation } from "@/domains/studio/api/submit-studio-problem-for-validation";

type StudioProblemSubmitForValidationButtonProps = {
  problemId: string;
  isDisabled?: boolean;
  className?: string;
};

export default function StudioProblemSubmitForValidationButton({
  problemId,
  isDisabled = false,
  className,
}: Readonly<StudioProblemSubmitForValidationButtonProps>) {
  const { mutate: submit, isPending } = useSubmitStudioProblemForValidation();

  const handleSubmit = () => {
    submit(
      { problemId },
      {
        onSuccess: () => toast.success("Submitted for validation"),
        onError: (error) =>
          toast.error(error.message || "Failed to submit for validation"),
      }
    );
  };

  return (
    <Button
      className={className}
      onClick={handleSubmit}
      disabled={isDisabled || isPending}
    >
      {isPending ? "Submitting..." : "Submit for validation"}
    </Button>
  );
}
