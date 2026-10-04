export interface User {
  id: string;
  username: string;
  bio?: string;
  imageUrl?: string | null;
  isPrivate: boolean;
  usernameLastChangedAt?: Date;
  setupCompletedAt?: Date;
  permissions: string[];
  roles: string[];
  languagePreferenceIds: string[];
}
