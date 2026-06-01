import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanService } from '../plan/plan.service';
import { CoachService } from 'src/coach/coach.service';
@Injectable()
export class LandingService {
  constructor(
    private prismaService: PrismaService,
    private planService: PlanService,
    private coachesService: CoachService,
  ) {}

  async getHeroData() {
    //until using redis for real data
    const [coaches, members, plans] = await Promise.all([
      this.prismaService.fitapi_coach.count(),
      this.prismaService.fitapi_membre.count(),
      this.prismaService.fitapi_subscriptionplan.count(),
    ]);

    return { coaches, members, plans };
  }

  async getCoachesData() {
    const coaches = await this.prismaService.fitapi_coach.findMany({
      select: {
        id: true,
        specialties: true,
        years_of_experience: true,
        biography: true,

        fitapi_user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },

        fitapi_coachreview: {
          select: {
            rating: true,
          },
        },

        fitapi_course: true,

        fitapi_coachcertificate: true,
      },
    });

    return coaches;
  }

  async getPlansData() {
    return this.planService.getAllPlans();
  }
}
