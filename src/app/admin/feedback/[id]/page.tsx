import AdminFeedbackDetailLayout from "@/views/admin/admin-feedback-detail-layout";

export default async function AdminFeedbackDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;

  return <AdminFeedbackDetailLayout id={id} />;
}
