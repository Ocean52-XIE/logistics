import { Controller, Get, Inject } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(
    @Inject(DashboardService)
    private readonly dashboardService: DashboardService
  ) {}

  @Get("summary")
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get("tasks")
  getTasks() {
    return this.dashboardService.getTasks();
  }
}
