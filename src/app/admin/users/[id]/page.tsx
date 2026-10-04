import AdminUserDetailLayout from "@/views/admin/admin-user-detail-layout";

export default async function AdminUserDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <AdminUserDetailLayout id={id} />;
}
