import { BadRequestException, Injectable } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { AnnexService } from 'src/annex/annex.service';
import bcrypt from 'bcrypt'
import { EmailService } from 'src/mail/mail.service';
@Injectable()
export class AuthenticationService {
  constructor(private annexService: AnnexService, private emailService: EmailService) {}

  async login(data: loginDTO) {
    const annex = await this.annexService.findAnnex(data.email);
    if (!annex) {
      throw new BadRequestException('Annex does not exists');
    }
    //logic to be added later
    return annex;
  }

  // async register(data: any) {
  //   //check if the annex admin exists
  //   const exists = await this.annexService.findAnnex(data.annexCode);

  //   if (exists) {
  //     throw new BadRequestException('Annex exists already');
  //   }

  //   const annex = await this.annexService.createAnnex(data);

  //   return {
  //     annex,
  //   };
  // }

  async forgetPassword(data: any){
    //check if the annex exists
    // const annex = await this.annexService.findAnnex(data.annexCode)

    // if(!annex){
    //   throw new BadRequestException('annex does not exists')
    // }

    // //generate reset token
    // const resetToken = await this.annexService.createResetToken(data.annexCode);
    
    //send email to the manager
    const email = this.emailService.sendPasswordResetEmail(data.email , 'resetToken' )

    return {
      'message': ' email sent to the manager'
    }
  }

  async resetPassword(data: any){
    //get the annex
    const annex = await this.annexService.findResetTokenAnnex(data.resetToken)

    if(!annex){{
      throw new BadRequestException('annex does not exists')
    }}

    //check the passwords matchs
    //to be deleted once validation is implemented
    if(data.password !== data.confirmPassword){
      throw new BadRequestException('password do not matches')
    }

    //update password
    let password = await bcrypt.hash(data.password, 10)

    await this.annexService.updateAnnex(data.annexCode, { password })
  }
}
