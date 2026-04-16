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
@Controller('annex')
export class AnnexController {
  constructor(private annexService: AnnexService) {}
  @Get('')
  @UseGuards(JwtAuthGuard)
  getAnnex(@CurrentAnnex() annex: any) {
    return annex;
  }
  // @Patch('update')
  // async updateAnnex(@Body() body: any){
  //     return await this.annexService.updateAnnex(body,body.annexCode);
  // }

  // @Delete('delete')
  // async deleteAnnex(){
  //     return 1;
  // }
}
