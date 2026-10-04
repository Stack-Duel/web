import { Button } from "@/shared/components/ui/button";
import type { Icon } from "@phosphor-icons/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type SocialLinkButtonProps = {
  href: string;
  icon: Icon;
  label: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"a">;

export default function SocialLinkButton({
  href,
  icon: IconComponent,
  label,
  children,
  ...props
}: Readonly<SocialLinkButtonProps>) {
  return (
    <Button variant="ghost" size={children ? "default" : "icon"} asChild>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={children ? undefined : label}
        {...props}
      >
        <IconComponent size={18} />
        {children}
      </a>
    </Button>
  );
}
