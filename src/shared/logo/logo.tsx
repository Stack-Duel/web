"use client";

import Image from "next/image";
import { useTenant } from "@/domains/tenant/state/tenant-store";
import { cn } from "@/shared/lib/utils";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: Readonly<LogoProps>) {
  const tenant = useTenant();

  return (
    <span className="flex items-center gap-1">
      <Image
        src={tenant.logo.light}
        alt={tenant.name}
        width={120}
        height={24}
        className={cn("h-6 w-auto dark:hidden", className)}
        priority
      />
      <Image
        src={tenant.logo.dark}
        alt={tenant.name}
        width={120}
        height={24}
        className={cn("hidden h-6 w-auto dark:block", className)}
        priority
      />
    </span>
  );
}
