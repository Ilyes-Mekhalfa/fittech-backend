import {
  Controller,
  Body,
  Get,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AnnexService } from './annex.service';
import { CurrentAnnex } from 'src/common/decorators/current-annex.decorator';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { Role } from 'src/common/decorators/role.decorator';
@Controller('annex')
export class AnnexController {
  constructor(private annexService: AnnexService) {}
  @Get('')
  @UseGuards(JwtAuthGuard)
  getAnnex(@CurrentAnnex() annex: any) {
    return annex;
  }
  @Patch('updateAnnex')
  @UseGuards(JwtAuthGuard)
  async updateAnnex(@Body() body: any, @CurrentAnnex() CurrentAnnex: any) {
    return await this.annexService.updateAnnex(body, CurrentAnnex.annexCode);
  }

  @Delete('deleteAnnex')
  @UseGuards(JwtAuthGuard)
  @Role('ADMIN')
  async deleteAnnex(@CurrentAnnex() currentAnnex: any) {
    return await this.annexService.deleteAnnex(currentAnnex.annexCode);
  }

  @Get('allMembers')
  @UseGuards(JwtAuthGuard)
  @Role('MANAGER')
  async getAnnexMmeber(){}

  @Get('allCoachs')
  @UseGuards(JwtAuthGuard)
  @Role('MANAGER')
  async getAnnexCoach(){}
}
