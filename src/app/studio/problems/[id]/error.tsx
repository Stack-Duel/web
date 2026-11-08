"use client";

import { useEffect } from "react";
import ErrorCard from "@/shared/components/error-card/error-card";
import { routerConfig } from "@/shared/router-config";

type StudioProblemErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StudioProblemError({
  error,
  reset,
}: Readonly<StudioProblemErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      onRetry={reset}
      homeHref={routerConfig.studioProblems.path}
      homeLabel="My problems"
    />
  );
}
