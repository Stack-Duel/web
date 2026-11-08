import StudioProblemLayout from "@/domains/studio/problems/problem/studio-problem-layout";

export default async function StudioProblem({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const id = (await params).id;

  return <StudioProblemLayout id={id} />;
}
