import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";

type AdminProblemValidationFailureAlertProps = {
  reason: string | null;
};

export default function AdminProblemValidationFailureAlert({
  reason,
}: Readonly<AdminProblemValidationFailureAlertProps>) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Validation failed</AlertTitle>
      <AlertDescription>
        <pre className="whitespace-pre-wrap break-words font-sans text-sm">
          {reason || "The problem failed validation for an unknown reason."}
        </pre>
      </AlertDescription>
    </Alert>
  );
}
