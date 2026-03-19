import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { LearningModule } from "../learning/learning.module";

@Module({
  imports: [LearningModule, AuthModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
