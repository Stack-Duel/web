import StudioProblemEditLayout from "@/domains/studio/problems/problem/edit/studio-problem-edit-layout";

export default async function StudioProblemEdit({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = (await params).id;

  return <StudioProblemEditLayout id={id} />;
}
