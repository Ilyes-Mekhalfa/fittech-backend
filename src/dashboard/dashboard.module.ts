import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
@Module({
  providers: [DashboardService, PrismaService, LandingService],
  controllers: [DashboardController],
})
export class DashboardModule {}
