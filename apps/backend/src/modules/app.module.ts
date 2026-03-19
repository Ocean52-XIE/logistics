import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { LearningModule } from "./learning/learning.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    HealthModule,
    LearningModule,
    DashboardModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
