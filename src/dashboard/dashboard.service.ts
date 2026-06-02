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
    const machines = this.prismaService.fitapi_machine.count();

    return { coaches, members, plans, machines };
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
    const [activeMembers, newMembers, subscribedMembers] =
      await Promise.all([
        this.prismaService.fitapi_user.count({
          where: {
            role: { in: ['member', 'Member'] },
            is_online: true,
          },
        }),
        this.prismService.fitapi_user.count([
            where: {
                role: { in: ['member', 'Member'] },
                created_at: {
                    lte: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
            }
        ]),
        this.prismaService.fitapi_membresubscription.count({
            where: {
                status: 'active',
            }
        })
      ]);
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
  }
}
