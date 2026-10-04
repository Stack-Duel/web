import React from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { cn } from "@/shared/lib/utils";

type LayoutProps = {
  mainClassName?: string;
} & React.ComponentProps<"div">;
export default function Layout({
  className,
  children,
  mainClassName,
  ...props
}: LayoutProps) {
  return (
    <div className={cn("flex min-h-svh flex-col", className)} {...props}>
      <header>
        <Navbar />
      </header>
      <main className={cn("flex-1", mainClassName)}>{children}</main>
      <Footer />
    </div>
  );
}
