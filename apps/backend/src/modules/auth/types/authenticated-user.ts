import type { UserRole } from "@logistics/shared";

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  organizationName: string;
}
