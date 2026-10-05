import { redirect } from "next/navigation";
import { routerConfig } from "@/shared/router-config";

export default function SettingsIndexPage() {
  redirect(routerConfig.settingsProfile.path);
}
