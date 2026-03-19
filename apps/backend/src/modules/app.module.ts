import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { LearningModule } from "./learning/learning.module";

@Module({
  imports: [HealthModule, LearningModule, DashboardModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
