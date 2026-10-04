"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import SettingsNav from "./settings-nav";

export default function SettingsShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarLayout breadcrumbs={[{ name: "Settings" }]}>
      <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-6">
        <div className="col-span-12 @3xl:col-span-3">
          <Card>
            <CardContent>
              <SettingsNav />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-12 @3xl:col-span-9">{children}</div>
      </div>
    </SidebarLayout>
  );
}
