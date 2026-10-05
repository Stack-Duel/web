"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import PriorityOrderList from "@/domains/user/components/priority-order-list";
import {
  useOrderedProblemPoolMembers,
  type OrderedPoolMember,
} from "../api/get-ordered-problem-pool-members";
import { useReorderProblemPool } from "../api/reorder-problem-pool";

type AdminPoolOrderListProps = {
  poolKey: string;
};

export default function AdminPoolOrderList({
  poolKey,
}: Readonly<AdminPoolOrderListProps>) {
  const { data, isLoading } = useOrderedProblemPoolMembers({ poolKey });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment order</CardTitle>
        <CardDescription>
          Drag to set the order problems are assigned in. Assignment picks up
          right after wherever it last left off, wrapping back to the top once
          it reaches the end.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add problems to this pool to set an order.
          </p>
        ) : (
          <AdminPoolOrderListContent
            key={data.map((member) => member.id).join(",")}
            poolKey={poolKey}
            members={data}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AdminPoolOrderListContent({
  poolKey,
  members,
}: Readonly<{ poolKey: string; members: OrderedPoolMember[] }>) {
  const initialOrder = members.map((member) => member.id);
  const [orderedIds, setOrderedIds] = useState<string[]>(initialOrder);
  const { mutate: reorder, isPending } = useReorderProblemPool();

  const isDirty = orderedIds.join(",") !== initialOrder.join(",");

  const handleSave = () => {
    reorder(
      { poolKey, problemIds: orderedIds },
      {
        onSuccess: () => toast.success("Order saved"),
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : "Failed to save order"
          ),
      }
    );
  };

  return (
    <div className="space-y-4">
      <PriorityOrderList
        items={members.map((member) => ({
          id: member.id,
          name: member.title,
        }))}
        orderedIds={orderedIds}
        onOrderedIdsChange={setOrderedIds}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!isDirty || isPending}>
          {isPending ? "Saving..." : "Save order"}
        </Button>
      </div>
    </div>
  );
}
