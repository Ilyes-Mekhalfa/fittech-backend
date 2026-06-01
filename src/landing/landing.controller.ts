import { Controller, Get } from '@nestjs/common';
import { LandingService } from './landing.service';
@Controller('landing')
export class LandingController {
  constructor(private landingService: LandingService) {}

  @Get('hero')
  async getHeroData() {
    return await this.landingService.getHeroData();
  }

  @Get('coaches')
  async getCoachesData() {
    return await this.landingService.getCoachesData();
  }

  @Get('plans')
  async getPlansData() {
    return await this.landingService.getPlansData();
  }
}
