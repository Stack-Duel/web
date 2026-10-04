import SettingsShell from "@/views/settings/settings-layout";
import { auth0 } from "@/shared/lib/auth0";
import { routerConfig } from "@/shared/router-config";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Manage your Algowars account and profile",
};

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth0.getSession();

  if (!session) {
    redirect(routerConfig.home.path);
  }

  return <SettingsShell>{children}</SettingsShell>;
}
