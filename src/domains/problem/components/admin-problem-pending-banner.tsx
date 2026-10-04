import { Loader2 } from "lucide-react";

export default function AdminProblemPendingBanner() {
  return (
    <div className="flex items-center gap-3 rounded-md border border-dashed bg-muted/40 px-4 py-3">
      <Loader2 size={18} className="animate-spin text-muted-foreground" />
      <div>
        <p className="text-sm font-medium">Validating this problem…</p>
        <p className="text-xs text-muted-foreground">
          Checking reference solutions against sample test cases and generating
          hidden test cases. This page will update automatically.
        </p>
      </div>
    </div>
  );
}
