import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';
@Injectable()
export class MemberService {
  constructor(private prismaService: PrismaService) {}

  async addMember(body: any) {
    const data = body;
    //check if the user exists
    const exists = await this.prismaService.fitapi_user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (exists) {
      throw new BadRequestException('mamber exists already');
    }

    //validate Data
    //to be done later

    //create member
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
    return await this.prismaService.fitapi_membre.create({
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
      where: {
        id,
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
  }

  async updateMember(id: string, body: any) {
    return await this.prismaService.fitapi_user.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
  }

  async archiveMember(id: string) {
    await this.prismaService.fitapi_user.update({
      where: {
        id,
      },
      data: {
        is_active: false,
        archived_at: new Date(),
      },
    });

    return true;
  }
  async deleteMember(id: string) {
    // check if the member exists
    const member = await this.prismaService.fitapi_membre.findUnique({
      where: {
        id,
      },
      select: {
        user_id: true,
      },
    });

    if (!member) {
      throw new BadRequestException('member does not exist');
    }

    const userId = member.user_id;

    // Deletion order: child records first, then parent records
    // 1. Delete payments (references both membre and membresubscription)
    await this.prismaService.fitapi_payment.deleteMany({
      where: {
        membre_id: id,
      },
    });

    // 2. Delete subscriptions (references membre)
    await this.prismaService.fitapi_membresubscription.deleteMany({
      where: {
        membre_id: id,
      },
    });

    // 3. Delete membre record
    await this.prismaService.fitapi_membre.delete({
      where: {
        id,
      },
    });

    // 4. Delete user groups
    await this.prismaService.fitapi_user_groups.deleteMany({
      where: {
        user_id: userId,
      },
    });

    // 5. Delete user permissions
    await this.prismaService.fitapi_user_user_permissions.deleteMany({
      where: {
        user_id: userId,
      },
    });

    // 6. Delete password reset tokens
    await this.prismaService.fitapi_passwordresettoken.deleteMany({
      where: {
        user_id: userId,
      },
    });

    // 7. Delete blacklisted tokens (delete blacklisted first, then outstanding)
    await this.prismaService.token_blacklist_blacklistedtoken.deleteMany({
      where: {
        token_blacklist_outstandingtoken: {
          user_id: userId,
        },
      },
    });

    // 8. Delete outstanding tokens
    await this.prismaService.token_blacklist_outstandingtoken.deleteMany({
      where: {
        user_id: userId,
      },
    });

    // 9. Delete admin logs
    await this.prismaService.django_admin_log.deleteMany({
      where: {
        user_id: userId,
      },
    });

    // 11. Delete user
    await this.prismaService.fitapi_user.delete({
      where: {
        id: userId,
      },
    });

    return true;
  }
}
