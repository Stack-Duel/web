"use client";

import * as React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import { MainErrorFallback } from "@/shared/errors/main-error-fallback";
import { TenantBridge } from "@/domains/tenant/components/tenant-bridge";
import type { ResolvedTenant } from "@/domains/tenant/lib/get-current-tenant";
import { ThemeProvider } from "@/shared/theme/theme-provider";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

type AppProvidersProps = {
  children: React.ReactNode;
  tenant: ResolvedTenant;
};

export default function AppProviders({
  children,
  tenant,
}: Readonly<AppProvidersProps>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ClerkProvider>
        <TooltipProvider delayDuration={0}>
          <ErrorBoundary FallbackComponent={MainErrorFallback}>
            <TenantBridge tenant={tenant} />
            <Toaster position="top-right" />
            {children}
          </ErrorBoundary>
        </TooltipProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
