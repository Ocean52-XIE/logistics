import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { LearningModule } from "../learning/learning.module";

@Module({
  imports: [LearningModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
