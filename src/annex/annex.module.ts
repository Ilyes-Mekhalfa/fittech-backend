import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SocketGateway } from 'src/socket/socket.gateway';
@Module({
  providers: [AnnexService, PrismaService, JwtService, SocketGateway],
  controllers: [AnnexController],
  exports: [AnnexService],
})
export class AnnexModule {}
