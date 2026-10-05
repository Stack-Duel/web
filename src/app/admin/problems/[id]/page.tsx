import AdminProblemDetailLayout from "@/views/admin/admin-problem-detail-layout";

export default async function AdminProblemDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <AdminProblemDetailLayout id={id} />;
}
