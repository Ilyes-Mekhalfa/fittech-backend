import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuditService } from 'src/audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name)
    constructor(private prismaService: PrismaService, private auditService: AuditService) { }

    //to get all the logs in the db for the admin
    async getAuditLogs() {
        return await this.auditService.getAuditLogs()
    }

    //active and archived users
    async getActiveUsers() {
        return await this.prismaService.fitapi_user.findMany({
            where: {
                is_active: false,
            }
        })
    }

    async getArchivedUsers() {
        return await this.prismaService.fitapi_user.findMany({
            where: {
                is_active: true
            }
        })
    }


    async archiveUser(id: any) {
        const user = await this.prismaService.fitapi_user.findUniqueOrThrow({
            where: {
                id,
            }
        })

        if (user.is_active) {
            throw new BadRequestException('user is already archived')
        }

        return await this.prismaService.fitapi_user.update({
            where: {
                id
            },
            data: {
                is_active: true,
                archived_at: new Date(),
            }
        })

    }

    @Cron('0 0 1 * *')
  async archiveInactiveUsers() {
    this.logger.log('Starting monthly archival batch...');

    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    const inactiveUsers = await this.prismaService.fitapi_user.findMany({
      where: {
        is_active: false,
        OR: [
          {
            last_login: null,
            created_at: { lt: cutoffDate },
          },
           {
            last_login: { lt: cutoffDate },
          },
        ],
      },
    });

    if (inactiveUsers.length === 0) {
      this.logger.log('No inactive users found.');
      return;
    }

    let success = 0;
    let failed = 0;

    for (const user of inactiveUsers) {
      try {
        await this.prismaService.fitapi_user.update({
          where: { id: user.id },
          data: {
            is_active: true,
            archived_at: new Date(),
          },
        });

        await this.auditService.createAuditLog({
          action: 'USER_ARCHIVED',
          user_id: user.id,
          performedBy: 'SYSTEM',
          status: 'SUCCESS',
          metadata : {
            message: 'Inactive for 1 year',
            last_login: user.last_login ?? 'never',
            trigger: 'monthly_batch',
          },
        });

        success++;
      } catch (error) {
        failed++;
        this.logger.error(`Failed to archive user ${user.id}: ${error.message}`);
      }
    }

    this.logger.log(`Batch done — Archived: ${success} | Failed: ${failed}`);
  }

    async restoreUser(id: any) {
        const user = await this.prismaService.fitapi_user.findUniqueOrThrow({
            where: {
                id,
            }
        })

        if (!user.is_active) {
            throw new BadRequestException('user is not archived')
        }

        return await this.prismaService.fitapi_user.update({
            where: {
                id
            },
            data: {
                is_active: false,
                archived_at: undefined,
            }
        })

    }

    async deleteUser(id: any) { }


}



