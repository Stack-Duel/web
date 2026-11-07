import type { AccessContext, NavLink } from "./nav-link";

function hasAccess(item: NavLink, ctx: AccessContext): boolean {
  if (item.featureFlag && !ctx.flags[item.featureFlag]) {
    return false;
  }

  if (item.permission) {
    const anyOf = Array.isArray(item.permission)
      ? item.permission
      : [item.permission];
    if (!anyOf.some((permission) => ctx.permissions.has(permission))) {
      return false;
    }
  }

  if (
    item.requireAllPermissions?.some(
      (permission) => !ctx.permissions.has(permission)
    )
  ) {
    return false;
  }

  if (item.isVisible && !item.isVisible(ctx)) {
    return false;
  }

  return true;
}

export function filterNavByAccess(
  items: NavLink[],
  ctx: AccessContext
): NavLink[] {
  return items
    .filter((item) => hasAccess(item, ctx))
    .map((item) =>
      item.items ? { ...item, items: filterNavByAccess(item.items, ctx) } : item
    )
    .filter((item) => item.url || (item.items?.length ?? 0) > 0);
}
