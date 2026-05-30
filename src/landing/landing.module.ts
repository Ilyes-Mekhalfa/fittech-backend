import { Module } from '@nestjs/common';
import { LandingService } from './landing.service';
import { LandingController } from './landing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../plan/plan.service';
import { CoachService } from '../coach/coach.service';
@Module({
  providers: [LandingService, PrismaService, PlanService, CoachService],
  controllers: [LandingController],
})
export class LandingModule {}
