"use client";

import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/ui/data-table";
import { useRequiredProblemLanguages } from "../api/required-languages/get-required-problem-languages";
import { useRemoveRequiredProblemLanguage } from "../api/required-languages/remove-required-problem-language";
import type { RequiredProblemLanguage } from "../models/required-language";

function RemoveCell({
  language,
}: Readonly<{ language: RequiredProblemLanguage }>) {
  const { mutate, isPending } = useRemoveRequiredProblemLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        mutate(
          { id: language.id },
          {
            onSuccess: () => toast.success(`Removed ${language.languageName}`),
            onError: (error) =>
              toast.error(error.message || "Failed to remove language"),
          }
        )
      }
    >
      Remove
    </Button>
  );
}

const columns: ColumnDef<RequiredProblemLanguage>[] = [
  {
    accessorKey: "languageName",
    header: "Language",
  },
  {
    accessorKey: "versionLabel",
    header: "Version",
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <RemoveCell language={row.original} />
      </div>
    ),
  },
];

export default function RequiredProblemLanguagesTable() {
  const { data, isLoading } = useRequiredProblemLanguages();

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={3}
      data={data ?? []}
      columns={columns}
    />
  );
}
