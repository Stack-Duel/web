// A fixed, known height (rather than letting py-2 + content decide it) so the CSS variable
// set by TopBanner can offset the sidebar by exactly this much: see
// shared/components/top-banner.tsx and its matching use in shared/components/ui/sidebar.tsx.
export const BANNER_HEIGHT = "2.5rem"; // h-10

// Fixed dark-on-white contrast regardless of the app's own light/dark theme. This is meant
// to grab attention as a distinct system banner, not blend in as page chrome.
export const bannerClassName =
  "sticky top-0 z-50 flex h-10 items-center gap-3 overflow-hidden bg-neutral-900 px-4 text-sm text-white";
export const ctaClassName = "bg-white text-neutral-900 hover:bg-white/90";
