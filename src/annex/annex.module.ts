import { Module } from '@nestjs/common';
import { AnnexService } from './annex.service';
import { AnnexController } from './annex.controller';

@Module({
  providers: [AnnexService],
  controllers: [AnnexController],
  exports: [AnnexService]
})
export class AnnexModule {}
