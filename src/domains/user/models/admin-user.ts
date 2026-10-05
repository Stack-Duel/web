import type { Group } from "./group";

export interface AdminUser {
  id: string;
  username: string;
  imageUrl?: string;
  usernameLastChangedAt?: Date;
  groups: Group[];
}
