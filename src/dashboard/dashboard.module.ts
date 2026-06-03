import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
import { PlanService } from '../plan/plan.service';
import { CoachService } from '../coach/coach.service';
@Module({
  providers: [
    DashboardService,
    PrismaService,
    LandingService,
    PlanService,
    CoachService,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
