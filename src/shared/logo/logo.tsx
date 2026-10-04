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
    <Image
      src={tenant.logo.light}
      alt={tenant.name}
      width={160}
      height={32}
      className={cn("h-8 w-auto", className)}
      priority
    />
  );
}
