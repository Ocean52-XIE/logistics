import { Injectable } from "@nestjs/common";
import type { HealthCheckResponse } from "@logistics/shared";

@Injectable()
export class HealthService {
  getHealth(): HealthCheckResponse {
    return {
      status: "ok",
      service: "logistics-training-backend",
      timestamp: new Date().toISOString(),
      version: "0.1.0"
    };
  }
}
