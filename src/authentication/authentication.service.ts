/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  forgetPasswordDTO,
  loginDTO,
  registerDTO,
  resetPasswordDTO,
} from './dto/authentication.dto';
import { AnnexService } from 'src/annex/annex.service';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthenticationService {
  constructor(
    private annexService: AnnexService,
    private emailService: EmailService,
    private config: ConfigService,
    private jwtService: JwtService,
  ) {}

  async login(data: loginDTO) {
    let annex = await this.annexService.findAnnex(data.email);
    if (!annex) {
      throw new BadRequestException('Annex does not exists');
    }
    //logic to be added later

    const correct: boolean = await bcrypt.compare(
      data.password,
      annex.password,
    );

    if (!correct) {
      throw new BadRequestException('Invalid credentials');
    }
    const { password, resetToken, resetTokenExpiry, ...safeAnnex } = annex;
    //add token
    const accessToken = this.jwtService.sign(
      {
        annexCode: annex.annexCode,
        annexName: annex.annexName,
      },
      { secret: this.config.get<string>('ACCESS_TOKEN') },
    );
    return { annex: safeAnnex, accessToken };
  }

  async register(data: registerDTO) {
    //check if the annex admin exists
    let registerData = { ...data };
    const exists = await this.annexService.findAnnex(data.email);

    if (exists) {
      throw new BadRequestException('Annex exists already');
    }

    //validate data
    //to be added later
    //hash password
    registerData.password = await bcrypt.hash(registerData.password, 11);
    const annex = await this.annexService.createAnnex(registerData);

    //add token
    const accessToken = this.jwtService.sign(
      {
        annexCode: annex.annexCode,
        annexName: annex.annexName,
      },
      { secret: this.config.get<string>('ACCESS_TOKEN') },
    );
    return {
      annex,
      accessToken,
    };
  }

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
    const password: string = await bcrypt.hash(data.password, 11);

    await this.annexService.updateAnnex(annex.annexCode, {
      password,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return {
      message: 'password reset successfully',
    };
  }
}
