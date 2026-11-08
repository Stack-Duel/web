"use client";

import { useEffect } from "react";
import ErrorCard from "@/shared/components/error-card/error-card";
import { routerConfig } from "@/shared/router-config";

type StudioProblemsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function StudioProblemsError({
  error,
  reset,
}: Readonly<StudioProblemsErrorProps>) {
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
