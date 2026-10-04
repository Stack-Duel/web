"use client";

import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DataTable } from "@/shared/components/ui/data-table";
import { useAdminFeatureFlags } from "../api/get-admin-feature-flags";
import { useUpdateFeatureFlagDefault } from "../api/update-feature-flag-default";
import ManageFeatureFlagDialog from "../components/manage-feature-flag-dialog";
import type { FeatureFlagAdmin } from "../models/feature-flag-admin";

function DefaultEnabledCell({ flag }: Readonly<{ flag: FeatureFlagAdmin }>) {
  const { mutate, isPending } = useUpdateFeatureFlagDefault();

  return (
    <Checkbox
      checked={flag.defaultEnabled}
      disabled={isPending}
      aria-label={`Toggle default enabled for ${flag.key}`}
      onCheckedChange={(checked) => {
        const defaultEnabled = checked === true;
        mutate(
          { id: flag.id, defaultEnabled },
          {
            onSuccess: () =>
              toast.success(
                `${flag.key} is now ${defaultEnabled ? "enabled" : "disabled"} by default`
              ),
            onError: (error) =>
              toast.error(error.message || "Failed to update feature flag"),
          }
        );
      }}
    />
  );
}

const columns: ColumnDef<FeatureFlagAdmin>[] = [
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "defaultEnabled",
    header: "Default enabled",
    cell: ({ row }) => <DefaultEnabledCell flag={row.original} />,
  },
  {
    accessorKey: "rolloutPercentage",
    header: "Rollout %",
    cell: ({ row }) => `${row.original.rolloutPercentage}%`,
  },
  {
    id: "overrides",
    header: "Overrides",
    cell: ({ row }) => {
      const count =
        row.original.userOverrides.length + row.original.groupOverrides.length;
      return count > 0 ? (
        <Badge variant="secondary">{count}</Badge>
      ) : (
        <span className="text-muted-foreground">None</span>
      );
    },
  },
  {
    id: "action",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ManageFeatureFlagDialog flag={row.original} />
      </div>
    ),
  },
];

export default function AdminFeatureFlagsTable() {
  const { data, isLoading } = useAdminFeatureFlags();

  return (
    <DataTable
      isLoading={isLoading}
      skeletonRows={5}
      data={data ?? []}
      columns={columns}
    />
  );
}
