"use client";

import ProblemTable from "@/domains/problem/tables/problem-table";
import ProblemSearchInput from "@/domains/problem/components/problem-search-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import SidebarLayout from "@/shared/layouts/sidebar-layout/sidebar-layout";
import SocialLinkButton from "@/shared/components/social-link-button";
import { discordLink } from "@/shared/lib/social-links";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import type { PageResult } from "@/shared/pagination/page-result";
import type { ProblemSummary } from "@/domains/problem/models/problem-summary";

interface ProblemsLayoutProps {
  initialProblems?: PageResult<ProblemSummary>;
}

export default function ProblemsLayout({
  initialProblems,
}: Readonly<ProblemsLayoutProps>) {
  return (
    <SidebarLayout
      breadcrumbs={[]}
      headerItems={
        <div className="ml-auto mr-3 flex items-center gap-2">
          <SocialLinkButton
            href={discordLink.href}
            icon={discordLink.icon}
            label="Join our Discord"
          >
            Join the Discord
          </SocialLinkButton>
          <ModeToggle />
        </div>
      }
    >
      <div className="@container px-2 md:px-4 pb-2 md:pb-4 grid grid-cols-12 gap-4">
        <Card className="col-span-12">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Problems</CardTitle>
            <ProblemSearchInput />
          </CardHeader>
          <CardContent>
            <ProblemTable initialProblems={initialProblems} />
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
