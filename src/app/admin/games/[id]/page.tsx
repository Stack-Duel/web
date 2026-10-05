import AdminGameDetailLayout from "@/views/admin/admin-game-detail-layout";

export default async function AdminGameDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <AdminGameDetailLayout id={id} />;
}
