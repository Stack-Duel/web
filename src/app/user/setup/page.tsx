import UserSetupLayout from "@/views/user/setup/user-setup-layout";
import { auth0 } from "@/shared/lib/auth0";
import { routerConfig } from "@/shared/router-config";
import { redirect } from "next/navigation";

export default async function UserSetupPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect(routerConfig.home.path);
  }

  return <UserSetupLayout />;
}
