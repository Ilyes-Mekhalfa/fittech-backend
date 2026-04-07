import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnexService } from 'src/annex/annex.service';

@Module({
  providers: [AuthenticationService, PrismaService, AnnexService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
