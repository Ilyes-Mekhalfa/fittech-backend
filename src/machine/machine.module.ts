import { Module } from '@nestjs/common';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // Import your WebSockets Gateway
@Module({
  providers: [MachineService, PrismaService, SocketGateway],
  controllers: [MachineController],
})
export class MachineModule {}
