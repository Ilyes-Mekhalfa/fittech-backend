import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AnnexService, PrismaService],
  controllers: [AnnexController],
  exports: [AnnexService],
})
export class AnnexModule {}
