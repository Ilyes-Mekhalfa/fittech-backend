import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LandingService } from '../landing/landing.service';
@Injectable()
export class DashboardService {
  constructor(
    private prismaService: PrismaService,
    private landingService: LandingService,
  ) {}

  async getStats() {
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
          gte: new Date(now.getFullYear(), now.getMonth(), 1), // first day of current month
          lt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // first day of next month
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
  }

  async getCoachStats() {
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
  }

  async getMemberStats() {
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
              lte: new Date(new Date().setDate(new Date().getDate() - 30)),
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
  }

  async getPlanStats() {
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
}
