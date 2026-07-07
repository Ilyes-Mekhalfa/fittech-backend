import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private prismaService: PrismaService,
    private landingService: LandingService,
    private redisService: RedisService,
    private socketGateway: SocketGateway,
  ) {}

  private readonly cacheTtlSeconds = 300;

  private async getCachedValue<T>(key: string, fallback: () => Promise<T>): Promise<T> {
    try {
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    } catch (error) {
      this.logger.warn(`Redis read failed for ${key}: ${error instanceof Error ? error.message : error}`);
    }

    const value = await fallback();

    try {
      await this.redisService.set(key, JSON.stringify(value), 'EX', this.cacheTtlSeconds);
    } catch (error) {
      this.logger.warn(`Redis write failed for ${key}: ${error instanceof Error ? error.message : error}`);
    }

    return value;
  }

  async getStats() {
    return this.getCachedValue('dashboard:stats', async () => {
      const { coaches, members, plans } = await this.landingService.getHeroData();
      const machines = await this.prismaService.fitapi_machine.count();

      const now = new Date();

      const monthlyRevenue = await this.prismaService.fitapi_payment.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          payment_status: 'completed',
          payment_date: {
            gte: new Date(now.getFullYear(), now.getMonth(), 1),
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      });

      return {
        coaches,
        members,
        plans,
        machines,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
      };
    });
  }

  async getCoachStats() {
    return this.getCachedValue('dashboard:coach-stats', async () => {
      const [activeCoaches, averageRating, totalCourses] = await Promise.all([
        this.prismaService.fitapi_user.count({
          where: {
            role: { in: ['coach', 'COACH'] },
            is_online: true,
          },
        }),
        this.prismaService.fitapi_coachreview
          .aggregate({
            _avg: {
              rating: true,
            },
          })
          .then((result) => result._avg.rating || 0),
        this.prismaService.fitapi_course.count(),
      ]);

      return { activeCoaches, averageRating, totalCourses };
    });
  }

  async getMemberStats() {
    return this.getCachedValue('dashboard:member-stats', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [activeMembers, newMembers, subscribedMembers, membersGrowth] =
        await Promise.all([
          this.prismaService.fitapi_user.count({
            where: {
              role: { in: ['member', 'Member'] },
              is_online: true,
            },
          }),
          this.prismaService.fitapi_user.findMany({
            where: {
              role: { in: ['member', 'Member'] },
              created_at: {
                gte: thirtyDaysAgo,
              },
            },
          }),
          this.prismaService.fitapi_membresubscription.count({
            where: {
              status: 'active',
              end_date: {
                gte: new Date(),
              },
            },
          }),
          this.prismaService.fitapi_user.groupBy({
            by: ['created_at'],
            where: {
              role: { in: ['member', 'Member'] },
            },
          }),
        ]);

      return {
        activeMembers,
        newMembers: newMembers.length,
        subscribedMembers,
        membersGrowth,
      };
    });
  }

  async getPlanStats() {
    return this.getCachedValue('dashboard:plan-stats', async () => {
      const [plans, machines] = await Promise.all([
        this.prismaService.fitapi_subscriptionplan.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
        }),
        this.prismaService.fitapi_machine.groupBy({
          by: ['type'],
          _count: {
            type: true,
          },
        }),
      ]);

      return {
        plans: plans.map((plan) => ({
          type: plan.type,
          count: plan._count.type,
        })),
        machines: machines.map((machine) => ({
          type: machine.type,
          count: machine._count.type,
        })),
      };
    });
  }

  async liveEntrance() {
    const entries = await this.prismaService.fitapi_gymentry.findMany({
      where: {
        entered_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      orderBy: {
        entered_at: 'desc',
      },
      select: {
        id: true,
        entered_at: true,
        date: true,
        fitapi_membre: {
          select: {
            fitapi_user: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    return entries.map((entry) => ({
      id: entry.id,
      enteredAt: entry.entered_at,
      date: entry.date,
      firstName: entry.fitapi_membre.fitapi_user.first_name,
      lastName: entry.fitapi_membre.fitapi_user.last_name,
      fullName: `${entry.fitapi_membre.fitapi_user.first_name} ${entry.fitapi_membre.fitapi_user.last_name}`,
    }));
  }

  // =========================================================================
  // REAL-TIME BROADCAST HUB METHODS
  // Call these from other services whenever user, coach, or machine data alters!
  // =========================================================================

  /**
   * Broadcasts updated general statistics to app-stats components
   */
  async broadcastGeneralStats() {
    try {
      const stats = await this.getStats();
      this.socketGateway.server.emit('general_stats_updated', stats);
    } catch (err) {
      this.logger.error('Failed to broadcast general stats:', err.message);
    }
  }

  /**
   * Broadcasts updated coach metrics to app-coach-stats components
   */
  async broadcastCoachStats() {
    try {
      const stats = await this.getCoachStats();
      this.socketGateway.server.emit('coach_stats_updated', stats);
    } catch (err) {
      this.logger.error('Failed to broadcast coach stats:', err.message);
    }
  }

  /**
   * Broadcasts updated membership figures and growth chart data to app-member-stats components
   */
  async broadcastMemberStats() {
    try {
      const stats = await this.getMemberStats();
      this.socketGateway.server.emit('member_stats_updated', stats);
    } catch (err) {
      this.logger.error('Failed to broadcast member stats:', err.message);
    }
  }

  /**
   * Broadcasts updated plan donut distribution charts to app-plan-stats components
   */
  async broadcastPlanStats() {
    try {
      const stats = await this.getPlanStats();
      this.socketGateway.server.emit('plan_stats_updated', stats);
    } catch (err) {
      this.logger.error('Failed to broadcast plan stats:', err.message);
    }
  }

  /**
   * Broadcasts a live turnstile entrance log message to the reception dashboard lists
   */
  async broadcastLiveEntrance() {
    try {
      const liveLog = await this.liveEntrance();
      this.socketGateway.server.emit('live_entrance_logged', liveLog);
    } catch (err) {
      this.logger.error('Failed to broadcast live entrance logs:', err.message);
    }
  }
}