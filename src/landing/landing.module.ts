import { Module } from '@nestjs/common';
import { LandingService } from './landing.service';
import { LandingController } from './landing.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../plan/plan.service';
import { CoachService } from '../coach/coach.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // Import your WebSockets Gateway
@Module({
  providers: [LandingService, PrismaService, PlanService, CoachService, SocketGateway],
  controllers: [LandingController],
})
export class LandingModule {}
