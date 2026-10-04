import AdminSubmissionDetailLayout from "@/views/admin/admin-submission-detail-layout";

export default async function AdminSubmissionDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <AdminSubmissionDetailLayout id={id} />;
}
