import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway';
@Module({
  controllers: [CoachController],
  providers: [CoachService, PrismaService, SocketGateway, SocketGateway],
})
export class CoachModule {}
