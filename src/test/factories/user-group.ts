import type { Group } from "@/domains/user/models/group";

export function buildGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: "group_1",
    name: "Admins",
    ...overrides,
  };
}
