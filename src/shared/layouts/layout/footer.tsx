import Link from "next/link";
import Logo from "@/shared/logo/logo";
import { routerConfig } from "@/shared/router-config";
import { socialLinks } from "@/shared/lib/social-links";
import { getCurrentTenant } from "@/domains/tenant/lib/get-current-tenant";

const platformLinks = [
  { name: "Problems", href: routerConfig.problems.path },
  { name: "Games", href: routerConfig.games.path },
  { name: "Dashboard", href: routerConfig.dashboard.path },
];

const companyLinks = [
  { name: "About", href: routerConfig.about.path },
  { name: "Blog", href: routerConfig.blog.path },
  { name: "Community", href: routerConfig.community.path },
];

const accountLinks = [
  { name: "Profile Settings", href: routerConfig.profileSettings.path },
];

export default async function Footer() {
  const tenant = await getCurrentTenant();

  return (
    <footer className="relative w-full overflow-hidden border-t">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:6rem_6rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]"
      />
      <div className="relative max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 gap-8 sm:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-3">
          <Logo className="h-10" />
          <p className="text-muted-foreground max-w-xs text-sm">
            {tenant.tagline}
          </p>
          <ul className="flex items-center gap-3 mt-1">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Platform</h3>
          <ul className="flex flex-col gap-2">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground text-sm hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="flex flex-col gap-2">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground text-sm hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Account</h3>
          <ul className="flex flex-col gap-2">
            <li>
              <Link
                href={routerConfig.authLogIn.path}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href={routerConfig.authSignUp.path}
                className="text-muted-foreground text-sm hover:text-foreground"
              >
                Sign Up
              </Link>
            </li>
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted-foreground text-sm hover:text-foreground"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {tenant.name}. {tenant.tagline}.
          </p>
        </div>
      </div>
    </footer>
  );
}
