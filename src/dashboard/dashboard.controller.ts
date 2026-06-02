import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return await this.dashboardService.getStats();
  }

  @Get('coachStats')
  async getCoachStats() {
    return await this.dashboardService.getCoachStats();
  }

  @Get('memberStats')
  async getMemberStats() {
    return await this.dashboardService.getMemberStats();
  }

  @Get('planStats')
  async getPlanStats() {
    return await this.dashboardService.getPlanStats();
  }
}
