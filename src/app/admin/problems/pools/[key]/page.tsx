import AdminProblemPoolDetailLayout from "@/views/admin/admin-problem-pool-detail-layout";

export default async function AdminProblemPoolDetailPage({
  params,
}: Readonly<{
  params: Promise<{ key: string }>;
}>) {
  const { key } = await params;

  return <AdminProblemPoolDetailLayout poolKey={key} />;
}
