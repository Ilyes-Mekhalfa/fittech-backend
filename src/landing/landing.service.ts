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
    // Keeping this optimized with Promise.all until you add your Redis caching tier
    const [coaches, members, plans] = await Promise.all([
      this.prismaService.fitapi_coach.count(),
      this.prismaService.fitapi_membre.count(),
      this.prismaService.fitapi_subscriptionplan.count(),
    ]);

    return { coaches, members, plans };
  }

  /**
   * Fetches public coach profiles.
   * Named getCoachData to map cleanly to your frontend Angular component calls.
   */
  async getCoachData() {
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

  // Fallback alias in case your current LandingController specifically calls the plural version
  async getCoachesData() {
    return this.getCoachData();
  }

  async getPlansData() {
    return this.planService.getAllPlans();
  }
}