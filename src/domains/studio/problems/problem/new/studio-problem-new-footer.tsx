import { Button } from "@/shared/components/ui/button";
import { SavePlus } from "lucide-react";

export default function StudioProblemNewFooter({
  isSubmitting,
  canSubmit,
}: Readonly<{ isSubmitting: boolean; canSubmit: boolean }>) {
  return (
    <Button type="submit" disabled={isSubmitting || !canSubmit}>
      <SavePlus className="mr-1" />
      {isSubmitting ? "Saving..." : "Save Draft"}
    </Button>
  );
}
