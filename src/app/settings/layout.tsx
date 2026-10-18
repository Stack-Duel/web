import type { Metadata } from "next";
import SettingsShell from "@/views/settings/settings-layout";
import { auth0 } from "@/shared/lib/auth0";
import { routerConfig } from "@/shared/router-config";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();

  return {
    title: "Settings",
    description: `Manage your ${tenant.name} account and profile`,
  };
}

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth0.getSession();

  if (!session) {
    redirect(routerConfig.home.path);
  }

  return <SettingsShell>{children}</SettingsShell>;
}
