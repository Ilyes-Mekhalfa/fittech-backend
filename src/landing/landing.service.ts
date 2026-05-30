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
    const { coaches } = await this.coachesService.getAllCoach();

    //getting reviews
    const Ids = coaches.map((coach: any) => coach.fitapi_coach.id);
    const reviews = await this.prismaService.fitapi_coachreview.groupBy({
      by: ['coach_id'],
      where: {
        coach_id: {
          in: Ids,
        },
      },
      _avg: {
        rating: true,
      },
    });
    return 1;
  }

  async getPlansData() {
    return this.planService.getAllPlans();
  }
}
