import { BadRequestException, Injectable } from '@nestjs/common';
import {
  forgetPasswordDTO,
  loginDTO,
  resetPasswordDTO,
} from './dto/authentication.dto';
import { AnnexService } from 'src/annex/annex.service';
import bcrypt from 'bcrypt';
import { EmailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthenticationService {
  constructor(
    private annexService: AnnexService,
    private emailService: EmailService,
    private config: ConfigService,
  ) {}

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

  async forgetPassword(data: forgetPasswordDTO) {
    //check if the annex exists
    const annex = await this.annexService.findAnnex(data.email);

    if (!annex) {
      throw new BadRequestException('annex does not exists');
    }

    //generate reset token
    const resetToken = await this.annexService.createResetToken(
      annex.annexCode,
    );

    //send email to the manager

    const link = `${this.config.get('BASE_URL')}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(annex.email, link);

    return {
      message: ' email sent to the manager',
    };
  }

  async resetPassword(data: resetPasswordDTO) {
    //get the annex
    const annex = await this.annexService.findResetTokenAnnex(data.resetToken);

    if (!annex) {
      {
        throw new BadRequestException('annex does not exists');
      }
    }

    //check the passwords matches
    //to be deleted once validation is implemented
    if (!data.password || !data.confirmPassword) {
      throw new BadRequestException(
        'password and confirm Password are not matched',
      );
    }

    //update password
    let password = await bcrypt.hash(data.password, 11);

    await this.annexService.updateAnnex(annex.annexCode, { password, resetToken: null, resetTokenExpiry: null });

    return {
      message: 'password reset successfully',
    };
  }
}
