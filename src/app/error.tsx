"use client";

import { useEffect } from "react";
import ErrorCard from "@/shared/components/error-card/error-card";
import { routerConfig } from "@/shared/router-config";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: Readonly<AppErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorCard
      onRetry={reset}
      homeHref={routerConfig.home.path}
      homeLabel="Go home"
    />
  );
}
