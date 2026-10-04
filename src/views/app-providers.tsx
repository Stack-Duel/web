"use client";

import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import { MainErrorFallback } from "@/shared/errors/main-error-fallback";
import { AuthBridge } from "@/domains/auth/auth-bridge";
import { TenantBridge } from "@/domains/tenant/components/tenant-bridge";
import type { ResolvedTenant } from "@/domains/tenant/lib/get-current-tenant";
import { FeedbackWidget } from "@/domains/feedback/components/feedback-widget";
import HealthCheck from "@/domains/health/components/health-check";
import { SessionData } from "@auth0/nextjs-auth0/types";
import ReactQueryProvider from "@/shared/lib/react-query";
import TopBanner from "@/shared/components/top-banner";
import AppInsightsProvider from "@/shared/lib/app-insights";
import { AuthGuard } from "@/shared/guards/auth-guard";
import { Permissions } from "@/shared/lib/permissions";

type AppProviders = {
  children: React.ReactNode;
  session: SessionData | null;
  tenant: ResolvedTenant;
};

export default function AppProviders({
  children,
  session,
  tenant,
}: Readonly<AppProviders>) {
  return (
    <AppInsightsProvider>
      <ReactQueryProvider>
        <ErrorBoundary FallbackComponent={MainErrorFallback}>
          <TenantBridge tenant={tenant} />
          <AuthBridge session={session} />
          <HealthCheck />
          <Toaster position="top-right" />
          <TopBanner />
          <AuthGuard permission={Permissions.FEEDBACK_CREATE} fallback={null}>
            <FeedbackWidget />
          </AuthGuard>
          {children}
        </ErrorBoundary>
      </ReactQueryProvider>
    </AppInsightsProvider>
  );
}
