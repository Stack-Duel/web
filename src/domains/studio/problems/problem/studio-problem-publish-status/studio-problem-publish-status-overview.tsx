"use client";

import { useSuspenseStudioProblemDetails } from "@/domains/studio/api/get-studio-problem";
import StudioProblemPublishChecklist from "./studio-problem-publish-checklist";
import StudioProblemPublishingPipeline from "./studio-problem-publishing-pipeline";

type StudioProblemPublishStatusOverviewProps = {
  id: string;
};

export default function StudioProblemPublishStatusOverview({
  id,
}: Readonly<StudioProblemPublishStatusOverviewProps>) {
  const { data } = useSuspenseStudioProblemDetails({
    problemId: id,
    queryConfig: {
      refetchInterval: (query) =>
        query.state.data?.status === "Pending" ||
        query.state.data?.publishReadiness?.isRevalidating
          ? 3_000
          : false,
    },
  });

  if (data.status === "Pending" || data.publishReadiness?.isRevalidating) {
    return <StudioProblemPublishingPipeline details={data} />;
  }

  if (data.publishReadiness?.lastAttemptStatus === "Failed") {
    return <StudioProblemPublishingPipeline details={data} />;
  }

  if (data.status === "Published") {
    return null;
  }

  return <StudioProblemPublishChecklist id={id} />;
}
