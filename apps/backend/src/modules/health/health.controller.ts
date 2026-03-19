import { Controller, Get, Inject } from "@nestjs/common";
import type { HealthCheckResponse } from "@logistics/shared";
import { HealthService } from "./health.service";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(HealthService)
    private readonly healthService: HealthService
  ) {}

  @Get()
  getHealth(): HealthCheckResponse {
    return this.healthService.getHealth();
  }
}
