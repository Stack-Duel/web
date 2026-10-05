"use client";

import * as React from "react";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import {
  AppInsightsContext,
  ReactPlugin,
} from "@microsoft/applicationinsights-react-js";
import { env } from "@/env";

export const reactPlugin = new ReactPlugin();

let appInsights: ApplicationInsights | undefined;

function getAppInsights() {
  if (appInsights) return appInsights;
  if (typeof window === "undefined") return undefined;
  if (!env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING) return undefined;

  appInsights = new ApplicationInsights({
    config: {
      connectionString: env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING,
      extensions: [reactPlugin],
      enableAutoRouteTracking: true,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      correlationHeaderExcludedDomains: ["*.auth0.com"],
    },
  });
  appInsights.loadAppInsights();

  return appInsights;
}

export default function AppInsightsProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    getAppInsights();
  }, []);

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      {children}
    </AppInsightsContext.Provider>
  );
}
