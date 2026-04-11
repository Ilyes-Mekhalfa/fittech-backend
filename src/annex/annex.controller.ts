import { Controller, Delete ,Patch} from '@nestjs/common';
import { Body } from '@nestjs/common';
import { AnnexService } from './annex.service';
@Controller('annex')
export class AnnexController {

    constructor(private annexService: AnnexService){}
    // @Patch('update')
    // async updateAnnex(@Body() body: any){
    //     return await this.annexService.updateAnnex(body,body.annexCode);
    // }

    // @Delete('delete')
    // async deleteAnnex(){
    //     return 1;
    // }


}
