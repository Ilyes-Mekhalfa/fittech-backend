import { BadRequestException, Injectable } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthenticationService {
  async login(data: loginDTO) {
    return 1;
  }

  async register(data: any) {
    //check if the annex admin exists
    const exists = await this.annnexService.findAnnex(data.annexId);

    if (exists) {
      throw new BadRequestException('Annex exists already');
    }

    const annex = await this.annexService.createAnnex(data);

    return {
      annex,
    };
  }
}
