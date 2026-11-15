import { Button } from "@/shared/components/ui/button";
import { SavePlus } from "lucide-react";

export default function StudioProblemNewFooter({
  isSubmitting,
}: Readonly<{ isSubmitting: boolean }>) {
  return (
    <Button type="submit" disabled={isSubmitting}>
      <SavePlus className="mr-1" />
      {isSubmitting ? "Saving..." : "Save Draft"}
    </Button>
  );
}
