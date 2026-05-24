import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, AuditService]
})
export class AdminModule {}
