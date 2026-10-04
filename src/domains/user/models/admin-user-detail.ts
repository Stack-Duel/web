import type { Group } from "./group";

export interface AdminUserDetail {
  id: string;
  username: string;
  imageUrl?: string;
  bio?: string;
  isPrivate: boolean;
  usernameLastChangedAt?: Date;
  createdAt: Date;
  setupCompletedAt?: Date;
  groups: Group[];
}
