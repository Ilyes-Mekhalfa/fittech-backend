import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { SocketGateway } from 'src/socket/socket.gateway';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, AuditService, SocketGateway],
})
export class AdminModule {}
