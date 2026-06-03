import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketModule } from '../socket/socket.module'
import { SocketGateway } from 'src/socket/socket.gateway';  
@Module({
  imports: [SocketModule],
  controllers: [MemberController],
  providers: [MemberService, PrismaService]
})
export class MemberModule {}
