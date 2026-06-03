import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class MemberService {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway,
  ) {}

  async addMember(body: any) {
    const data = body;
    // Check if the user exists
    const exists = await this.prismaService.fitapi_user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (exists) {
      throw new BadRequestException('member exists already');
    }

    // Create user base record
    const user = await this.prismaService.fitapi_user.create({
      data: {
        id: randomUUID(),
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'Member',
        phone: data.phone,
        is_active: true,
        is_online: false,
        created_at: new Date(),
        is_superuser: false,
        is_staff: false,
      },
      select: {
        id: true,
      },
    });

    const newMember = await this.prismaService.fitapi_membre.create({
      data: {
        id: randomUUID(),
        join_date: new Date(),
        user_id: user.id,
        date_of_birth: data.date_of_birth,
        health_goal: data.health_goal,
        medical_restrictions: data.medical_restrictions,
      },
      omit: {
        user_id: true,
      },
      include: {
        fitapi_user: {
          omit: {
            password: true,
            is_active: true,
            created_at: true,
            last_login: true,
            role: true,
          },
        },
      },
    });

    // 1. Emit live registration notice to management logs
    this.socketGateway.server.emit('member_added', newMember);

    return newMember;
  }

  async getAllMembers() {
    return await this.prismaService.fitapi_membre.findMany({
      where: {
        fitapi_user: {
          is_active: true,
        },
      },
      omit: {
        user_id: true,
      },
      include: {
        fitapi_user: {
          omit: {
            password: true,
            is_active: true,
            last_login: true,
            role: true,
          },
        },
        fitapi_membresubscription: true,
      },
    });
  }

  async getMember(id: string) {
    return await this.prismaService.fitapi_membre.findUnique({
      where: { id },
      omit: {
        user_id: true,
      },
      include: {
        fitapi_user: {
          omit: {
            password: true,
            is_active: true,
            created_at: true,
            last_login: true,
            role: true,
          },
        },
      },
    });
  }

  async updateMember(id: string, body: any) {
    const updatedUser = await this.prismaService.fitapi_user.update({
      where: { id },
      data: {
        ...body,
      },
    });

    // 2. Broadcast updates so row fields rewrite themselves on screen
    this.socketGateway.server.emit('member_updated', updatedUser);

    return updatedUser;
  }

  async archiveMember(id: string) {
    await this.prismaService.fitapi_user.update({
      where: { id },
      data: {
        is_active: false,
        archived_at: new Date(),
      },
    });

    // 3. Normalized real-time broadcast across matching dashboards
    this.socketGateway.server.emit('member_deleted', { id });

    return { message: 'Member archived successfully', id };
  }

  async deleteMember(id: string) {
    // Check if the member exists
    const member = await this.prismaService.fitapi_membre.findUnique({
      where: { id },
      select: {
        user_id: true,
      },
    });

    if (!member) {
      throw new BadRequestException('member does not exist');
    }

    const userId = member.user_id;

    // Deletion order: child records first, then parent records
    await this.prismaService.fitapi_payment.deleteMany({
      where: { membre_id: id },
    });
    await this.prismaService.fitapi_membresubscription.deleteMany({
      where: { membre_id: id },
    });
    await this.prismaService.fitapi_membre.delete({ where: { id } });

    // Auth and infrastructure logs
    await this.prismaService.fitapi_user_groups.deleteMany({
      where: { user_id: userId },
    });
    await this.prismaService.fitapi_user_user_permissions.deleteMany({
      where: { user_id: userId },
    });
    await this.prismaService.fitapi_passwordresettoken.deleteMany({
      where: { user_id: userId },
    });

    // JWT token tracking tables cleanup
    await this.prismaService.token_blacklist_blacklistedtoken.deleteMany({
      where: {
        token_blacklist_outstandingtoken: {
          user_id: userId,
        },
      },
    });
    await this.prismaService.token_blacklist_outstandingtoken.deleteMany({
      where: { user_id: userId },
    });
    await this.prismaService.django_admin_log.deleteMany({
      where: { user_id: userId },
    });

    // Final core entity removal
    await this.prismaService.fitapi_user.delete({ where: { id: userId } });

    // 4. Emit instant eviction event to purge row tracking records from screens
    this.socketGateway.server.emit('member_deleted', { id });

    return true;
  }
}
