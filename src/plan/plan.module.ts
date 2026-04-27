import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PlanService } from './plan.service';

@Module({
  controllers: [PlanController],
  providers :[PrismaService, PlanService]
})
export class PlanModule {}
