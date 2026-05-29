import {
  Controller,
  Delete,
  Patch,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CoachService } from './coach.service';

@Controller('coach')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post('add')
  async addCoach(@Body() body: any) {
    return await this.coachService.addCoach(body);
  }

  @Get('allCoachs')
  async getAllCoach() {
    return await this.coachService.getAllCoach();
  }

  @Get(':id')
  async getCoach(@Param('id') id: string) {
    return await this.coachService.getCoach(id);
  }

  @Patch('updateCoach/:id')
  async updateCoach(@Param('id') id: string, @Body() body: any) {
    return await this.coachService.updateCoach(id, body);
  }

  @Post('addCourse/:coachId')
  async addNewCourse(@Param('coachId') coachId: string, @Body() body: any) {
    return await this.coachService.addNewCourse(coachId, body);
  }

  @Patch('archiveCoach/:id')
  async archiveCoach(@Param('id') id: string){
    return await this.coachService.archiveCoach(id)
  }
  @Delete('deleteCoach/:id')
  async deletCoach(@Param('id') id: string) {
    return await this.coachService.deleteCoach(id);
  }
}
