"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminFeedbackDetail } from "@/domains/feedback/api/get-admin-feedback-detail";
import { useUpdateFeedbackStatus } from "@/domains/feedback/api/update-feedback-status";
import type {
  AdminFeedbackDetail,
  FeedbackStatus,
} from "@/domains/feedback/models/feedback";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import { AdminRestrictedFallback } from "./admin-restricted-fallback";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "New", label: "New" },
  { value: "Triaged", label: "Triaged" },
  { value: "InProgress", label: "In progress" },
  { value: "Resolved", label: "Resolved" },
  { value: "WontFix", label: "Won't fix" },
];

type AdminFeedbackDetailLayoutProps = {
  id: string;
};

export default function AdminFeedbackDetailLayout({
  id,
}: Readonly<AdminFeedbackDetailLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_FEEDBACK_READ}
      fallback={
        <NotFoundCard
          title="Page not found"
          description="We could not find the page you are looking for. It may have been removed, renamed, or the link is incorrect."
        />
      }
    >
      <SidebarLayout
        breadcrumbs={[
          { name: "Admin", url: "/admin" },
          { name: "Feedback", url: "/admin/feedback" },
          { name: id },
        ]}
      >
        <AdminFeedbackDetailContent id={id} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminFeedbackDetailContent({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, error } = useAdminFeedbackDetail({ id });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-sm text-destructive">Feedback not found.</div>
    );
  }

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.type}
            <Badge variant="secondary">{data.status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm">{data.message}</p>
          <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div>
              <dt className="font-medium text-foreground">User</dt>
              <dd>{data.user.username}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Rating</dt>
              <dd>{data.rating ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Submitted</dt>
              <dd>{new Date(data.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Page</dt>
              <dd className="truncate">{data.pageUrl ?? "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      <AuthGuard
        permission={Permissions.ADMIN_FEEDBACK_UPDATE}
        fallback={<AdminRestrictedFallback />}
      >
        <FeedbackStatusCard feedback={data} />
      </AuthGuard>
    </div>
  );
}

function FeedbackStatusCard({
  feedback,
}: Readonly<{ feedback: AdminFeedbackDetail }>) {
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
  const [adminNote, setAdminNote] = useState(feedback.adminNote ?? "");
  const mutation = useUpdateFeedbackStatus({
    mutationConfig: {
      onSuccess: () => toast.success("Feedback updated"),
      onError: () => toast.error("Couldn't update feedback"),
    },
  });

  return (
    <Card className="col-span-12">
      <CardHeader>
        <CardTitle>Triage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as FeedbackStatus)}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="adminNote">Admin note</FieldLabel>
          <Textarea
            id="adminNote"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
          />
        </Field>
      </CardContent>
      <CardFooter>
        <Button
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({
              id: feedback.id,
              status,
              adminNote: adminNote.trim().length > 0 ? adminNote.trim() : null,
            })
          }
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
