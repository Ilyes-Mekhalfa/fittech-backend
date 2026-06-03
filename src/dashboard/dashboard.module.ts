import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
import { PlanService } from '../plan/plan.service';
import { CoachService } from '../coach/coach.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // Import your WebSockets Gateway
@Module({
  providers: [
    DashboardService,
    PrismaService,
    LandingService,
    PlanService,
    CoachService,
    SocketGateway,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
