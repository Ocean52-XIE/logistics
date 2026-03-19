import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import type { UserProfile } from "@logistics/shared";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    @Inject(AdminService)
    private readonly adminService: AdminService
  ) {}

  @Get("users")
  async getUsers(): Promise<UserProfile[]> {
    return this.adminService.getUsers();
  }
}
