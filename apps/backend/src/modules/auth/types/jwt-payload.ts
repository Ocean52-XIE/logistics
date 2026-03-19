import type { UserRole } from "@logistics/shared";

export interface JwtPayload {
  sub: string;
  username: string;
  name: string;
  role: UserRole;
  organizationName: string;
}
