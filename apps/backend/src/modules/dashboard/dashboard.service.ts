import { Inject, Injectable } from "@nestjs/common";
import type { DashboardSummary, DashboardTask } from "@logistics/shared";
import { LearningService } from "../learning/learning.service";

@Injectable()
export class DashboardService {
  constructor(
    @Inject(LearningService)
    private readonly learningService: LearningService
  ) {}

  getSummary(userId: string): Promise<DashboardSummary> {
    return this.learningService.getDashboardSummary(userId);
  }

  getTasks(userId: string): Promise<DashboardTask[]> {
    return this.learningService.getDashboardTasks(userId);
  }
}
