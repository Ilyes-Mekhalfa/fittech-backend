import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AnnexService, PrismaService, JwtService],
  controllers: [AnnexController],
  exports: [AnnexService],
})
export class AnnexModule {}
