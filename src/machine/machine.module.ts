import { Module } from '@nestjs/common';
import { MachineService } from './machine.service';
import { MachineController } from './machine.controller';
import { PrismaService } from '../prisma/prisma.service';
@Module({
  providers: [MachineService, PrismaService],
  controllers: [MachineController],
})
export class MachineModule {}
