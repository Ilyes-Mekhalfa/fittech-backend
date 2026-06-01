import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketModule } from '../socket/socket.module'
@Module({
  imports: [SocketModule],
  controllers: [MemberController],
  providers: [MemberService, PrismaService]
})
export class MemberModule {}
