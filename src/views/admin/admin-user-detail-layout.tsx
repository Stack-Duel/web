"use client";

import { useAdminUserDetail } from "@/domains/user/api/get-admin-user-detail";
import EditUserGroupsDialog from "@/domains/user/components/edit-user-groups-dialog";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";
import NotFoundCard from "@/shared/components/not-found-card/not-found-card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";

type AdminUserDetailLayoutProps = {
  id: string;
};

export default function AdminUserDetailLayout({
  id,
}: Readonly<AdminUserDetailLayoutProps>) {
  return (
    <AuthGuard
      permission={Permissions.ADMIN_USERS_READ}
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
          { name: "Users", url: "/admin/users" },
          { name: id },
        ]}
      >
        <AdminUserDetailContent id={id} />
      </SidebarLayout>
    </AuthGuard>
  );
}

function AdminUserDetailContent({ id }: Readonly<{ id: string }>) {
  const { data, isLoading, error } = useAdminUserDetail({ id });

  if (isLoading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>;
  }

  if (error || !data) {
    return <div className="p-4 text-sm text-destructive">User not found.</div>;
  }

  return (
    <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
      <Card className="col-span-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarImage src={data.imageUrl} alt={data.username} />
              <AvatarFallback>
                {data.username[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            {data.username}
            <Badge variant={data.isPrivate ? "outline" : "secondary"}>
              {data.isPrivate ? "Private" : "Public"}
            </Badge>
            <Badge variant={data.setupCompletedAt ? "secondary" : "outline"}>
              {data.setupCompletedAt ? "Setup complete" : "Setup incomplete"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.bio ? (
            <p className="whitespace-pre-wrap text-sm">{data.bio}</p>
          ) : null}
          <dl className="grid grid-cols-2 gap-2 text-sm text-muted-foreground @md:grid-cols-4">
            <div>
              <dt className="font-medium text-foreground">Joined</dt>
              <dd>{new Date(data.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Setup completed</dt>
              <dd>
                {data.setupCompletedAt
                  ? new Date(data.setupCompletedAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                Username last changed
              </dt>
              <dd>
                {data.usernameLastChangedAt
                  ? new Date(data.usernameLastChangedAt).toLocaleString()
                  : "-"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {data.groups.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {data.groups.map((group) => (
                <Badge key={group.id} variant="secondary">
                  {group.name}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No groups</span>
          )}
        </CardContent>
        <AuthGuard
          permission={Permissions.ADMIN_USER_GROUPS_UPDATE}
          fallback={null}
        >
          <CardFooter>
            <EditUserGroupsDialog user={data} />
          </CardFooter>
        </AuthGuard>
      </Card>
    </div>
  );
}
