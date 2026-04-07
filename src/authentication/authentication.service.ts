import { BadRequestException, Injectable } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { AnnexService } from 'src/annex/annex.service';

@Injectable()
export class AuthenticationService {
  constructor(private annexService: AnnexService) {}
  async login(data: loginDTO) {
    const annex = await this.annexService.findAnnex(data.code);
    if (!annex) {
      throw new BadRequestException('Annex does not exists');
    }

    return annex;
  }

  async register(data: any) {
    //check if the annex admin exists
    const exists = await this.annexService.findAnnex(data.annexId);

    if (exists) {
      throw new BadRequestException('Annex exists already');
    }

    const annex = await this.annexService.createAnnex(data);

    return {
      annex,
    };
  }
}
