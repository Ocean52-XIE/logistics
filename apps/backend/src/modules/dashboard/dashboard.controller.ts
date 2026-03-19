import { Controller, Get, Inject, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("employee", "manager", "trainer", "admin")
export class DashboardController {
  constructor(
    @Inject(DashboardService)
    private readonly dashboardService: DashboardService
  ) {}

  @Get("summary")
  getSummary(@CurrentUser("id") userId: string | null) {
    return this.dashboardService.getSummary(userId ?? "");
  }

  @Get("tasks")
  getTasks(@CurrentUser("id") userId: string | null) {
    return this.dashboardService.getTasks(userId ?? "");
  }
}
