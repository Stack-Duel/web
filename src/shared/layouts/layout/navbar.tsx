"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import Logo from "@/shared/logo/logo";
import { routerConfig } from "@/shared/router-config";
import { ModeToggle } from "@/shared/theme/mode-toggle";
import SocialLinkButton from "@/shared/components/social-link-button";
import { discordLink } from "@/shared/lib/social-links";
import { useTenant } from "@/domains/tenant/state/tenant-store";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const { isSignedIn } = useUser();
  const tenant = useTenant();

  const defaultRoutes = [
    { name: "Home", href: routerConfig.home.path },
    { name: "Problems", href: routerConfig.problems.path },
    { name: "Games", href: routerConfig.games.path },
    { name: "Blog", href: routerConfig.blog.path },
    { name: "About", href: routerConfig.about.path },
    { name: "Community", href: routerConfig.community.path },
  ];

  return (
    <nav className="fixed inset-x-0 top-4 z-50 px-4">
      <div className="max-w-6xl py-3 mx-auto grid grid-cols-2 lg:grid-cols-3 gap-3 px-6 rounded-full border bg-background/60 shadow-lg backdrop-blur-md">
        <Logo className="h-9" />
        <ul className="hidden justify-self-center lg:flex items-center gap-3 text-muted-foreground">
          {defaultRoutes.map((route) => (
            <li key={route.href} className="hidden lg:block">
              <Link href={route.href}>{route.name}</Link>
            </li>
          ))}
        </ul>
        <ul className="justify-self-end flex row-reverse lg:row items-center gap-2 lg:gap-3">
          {isSignedIn ? (
            <>
              <li className="hidden lg:block">
                <Button asChild variant="outline">
                  <Link href={routerConfig.dashboard.path}>Dashboard</Link>
                </Button>
              </li>
              <li className="hidden lg:block">
                <UserButton />
              </li>
            </>
          ) : (
            <>
              <li className="hidden lg:block">
                <Button asChild variant="ghost" data-testid="sign-in-button">
                  <SignInButton mode="modal" />
                </Button>
              </li>
              <li className="hidden lg:block">
                <Button
                  asChild
                  variant="default"
                  className="rounded-full"
                  data-testid="sign-up-button"
                >
                  <SignUpButton mode="modal" />
                </Button>
              </li>
            </>
          )}
          <li>
            <SocialLinkButton
              href={discordLink.href}
              icon={discordLink.icon}
              label="Join our Discord"
            />
          </li>
          <li>
            <ModeToggle />
          </li>
          <li className="block lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" aria-label="Open navigation menu">
                  <MenuIcon aria-hidden="true" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <Logo className="h-9" />
                  </SheetTitle>
                </SheetHeader>
                <div className="px-2">
                  <ul className="flex flex-col gap-2">
                    {defaultRoutes.map((route) => (
                      <li key={route.href}>
                        <Button
                          variant="ghost"
                          asChild
                          className="w-full py-5 text-start justify-start"
                        >
                          <Link href={route.href}>{route.name}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                <SheetFooter>
                  {isSignedIn ? (
                    <div className="flex items-center gap-3">
                      <UserButton />
                      <Button asChild variant="default" className="grow">
                        <Link href={routerConfig.dashboard.path}>
                          Dashboard
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Card className="rounded">
                      <CardHeader>
                        <CardTitle>Join the {tenant.name} community</CardTitle>
                        <CardDescription>
                          Sign up to track progress, solve problems, and
                          compete.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="grow"
                          data-testid="sign-in-button"
                        >
                          <SignInButton mode="modal" />
                        </Button>
                        <Button
                          asChild
                          variant="default"
                          data-testid="sign-up-button"
                        >
                          <SignUpButton mode="modal" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </div>
    </nav>
  );
}
