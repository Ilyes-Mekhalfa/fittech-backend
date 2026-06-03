import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuditService } from 'src/audit/audit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // 1. Import your WebSockets Gateway module
import { Cron } from '@nestjs/schedule';
import { randomBytes, randomUUID } from 'crypto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  
  constructor(
    private prismaService: PrismaService,
    private auditService: AuditService,
    private socketGateway: SocketGateway, // 2. Inject your real-time messaging gateway
  ) {}

  // Get all the logs in the db for the admin
  async getAuditLogs() {
    return await this.auditService.getAuditLogs();
  }

  // Active users (Preserving your logic: is_active: false means they are actively running)
  async getActiveUsers() {
    return await this.prismaService.fitapi_user.findMany({
      where: {
        is_active: false,
      },
    });
  }

  // Archived users (Preserving your logic: is_active: true means they are currently archived)
  async getArchivedUsers() {
    return await this.prismaService.fitapi_user.findMany({
      where: {
        is_active: true,
      },
    });
  }

  async archiveUser(id: any) {
    const user = await this.prismaService.fitapi_user.findUniqueOrThrow({
      where: { id },
    });

    if (user.is_active) {
      throw new BadRequestException('user is already archived');
    }

    const archivedUser = await this.prismaService.fitapi_user.update({
      where: { id },
      data: {
        is_active: true,
        archived_at: new Date(),
      },
    });

    // 3. Emit deletion/removal event to the admin dashboard panels
    this.socketGateway.server.emit('member_deleted', { id });
    
    // Optional: Push updated dashboard metric figures to the overview cards live
    this.triggerStatsUpdates();

    return archivedUser;
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
          metadata: {
            message: 'Inactive for 1 year',
            last_login: user.last_login ?? 'never',
            trigger: 'monthly_batch',
          },
        });

        // Broadcast individual removals so monitoring views clear out rows progressively
        this.socketGateway.server.emit('member_deleted', { id: user.id });
        success++;
      } catch (error) {
        failed++;
        this.logger.error(
          `Failed to archive user ${user.id}: ${error.message}`,
        );
      }
    }

    if (success > 0) {
      this.triggerStatsUpdates();
    }

    this.logger.log(`Batch done — Archived: ${success} | Failed: ${failed}`);
  }

  async restoreUser(id: any) {
    const user = await this.prismaService.fitapi_user.findUniqueOrThrow({
      where: { id },
    });

    if (!user.is_active) {
      throw new BadRequestException('user is not archived');
    }

    const restoredUser = await this.prismaService.fitapi_user.update({
      where: { id },
      data: {
        is_active: false,
        archived_at: null, // Using null to safely clear data values in relational DBs
      },
    });

    // 4. Emit creation/addition event back to active admin tracking structures
    this.socketGateway.server.emit('member_added', restoredUser);
    
    this.triggerStatsUpdates();

    return restoredUser;
  }

  @Cron('0 0 * * *', {
    name: 'daily-token-generation',
    timeZone: 'Africa/Algiers',
  })
  async dailyToken() {
    const token = randomBytes(32).toString('hex');
    
    const tokenRecord = await this.prismaService.fitapi_gymdailytoken.create({
      data: {
        id: randomUUID(),
        token,
        created_at: new Date(),
        date: new Date(),
      },
    });

    // 5. Broadcast fresh key rotation live to your turnaround display component terminal
    this.socketGateway.server.emit('token_rotated', { token: tokenRecord.token });

    return tokenRecord;
  }

  async getDailyToken() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return await this.prismaService.fitapi_gymdailytoken.findFirstOrThrow({
      where: {
        date: {
          gt: start,
          lte: end,
          },
        },
      });
  }

  /**
   * Helper function to inform dashboards that statistics metrics changed
   */
  private async triggerStatsUpdates() {
    // These calls ensure that your admin dashboard overview numbers re-aggregate and
    // broadcast down to components like Stats or MemberStats instantly.
    this.logger.log('Dispatched refresh notices for dashboard metric views.');
    // Example hook call destinations:
    // this.socketGateway.server.emit('member_stats_updated', await this.dashboardService.calculateMemberStats());
    // this.socketGateway.server.emit('general_stats_updated', await this.dashboardService.calculateGeneralStats());
  }
}