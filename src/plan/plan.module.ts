import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlanService } from './plan.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // Import your WebSockets Gateway

@Module({
  controllers: [PlanController],
  providers :[PrismaService, PlanService, SocketGateway], // Inject your real-time messaging gateway
})
export class PlanModule {}
