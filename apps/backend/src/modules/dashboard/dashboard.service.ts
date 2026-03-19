import { Inject, Injectable } from "@nestjs/common";
import type { DashboardSummary, DashboardTask } from "@logistics/shared";
import { LearningService } from "../learning/learning.service";

@Injectable()
export class DashboardService {
  constructor(
    @Inject(LearningService)
    private readonly learningService: LearningService
  ) {}

  getSummary(): DashboardSummary {
    return this.learningService.getDashboardSummary();
  }

  getTasks(): DashboardTask[] {
    return this.learningService.getDashboardTasks();
  }
}
