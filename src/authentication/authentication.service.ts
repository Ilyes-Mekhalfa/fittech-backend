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
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthenticationService {
  constructor(
    private annexService: AnnexService,
    private emailService: EmailService,
    private config: ConfigService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(data: loginDTO) {
    const annex = await this.annexService.findAnnex(data.email);
    if (!annex) {
      throw new BadRequestException('Annex does not exists');
    }

    const correct: boolean = await bcrypt.compare(
      data.password,
      annex.password,
    );

    if (!correct) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign(
      {
        annexCode: annex.id,
        annexName: annex.first_name,
        role: annex.role,
      },
      { secret: this.config.get<string>('ACCESS_TOKEN') },
    );

    return { annex, accessToken };
  }

  async register(data: registerDTO) {
    const exists = await this.annexService.findAnnex(data.email);

    if (exists) {
      throw new BadRequestException('Annex exists already');
    }

    const hashedPassword = await bcrypt.hash(data.password, 11);

    const annex = await this.annexService.createAnnex({
      id: randomUUID(),
      email: data.email,
      password: hashedPassword,
      first_name: data.annexName,
      last_name: data.annexLocation || '',
      role: data.role,
      phone: data.phone || null,
      is_active: true,
      is_online: false,
      is_superuser: data.role === 'ADMIN',
      is_staff: true,
      created_at: new Date(),
    });

    const accessToken = this.jwtService.sign(
      {
        annexCode: annex.id,
        annexName: annex.first_name,
        role: annex.role,
      },
      { secret: this.config.get<string>('ACCESS_TOKEN') },
    );

    return {
      annex,
      accessToken,
    };
  }

  async forgetPassword(data: forgetPasswordDTO) {
    const annex = await this.annexService.findAnnex(data.email);

    if (!annex) {
      throw new BadRequestException('annex does not exists');
    }

    const resetToken = randomUUID();
    await this.prisma.fitapi_passwordresettoken.create({
      data: {
        token: resetToken,
        created_at: new Date(),
        is_used: false,
        user_id: annex.id,
      },
    });

    const link = `${this.config.get('BASE_URL') || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetEmail(annex.email, link);

    return {
      message: ' email sent to the manager',
    };
  }

  async resetPassword(data: resetPasswordDTO) {
    const tokenRecord = await this.prisma.fitapi_passwordresettoken.findUnique({
      where: { token: data.resetToken },
      include: { fitapi_user: true },
    });

    if (!tokenRecord || tokenRecord.is_used) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (tokenRecord.created_at < oneHourAgo) {
      throw new BadRequestException('Reset token has expired');
    }

    if (data.password !== data.confirmPassword) {
      throw new BadRequestException(
        'password and confirm Password are not matched',
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 11);

    await this.prisma.fitapi_user.update({
      where: { id: tokenRecord.user_id },
      data: {
        password: hashedPassword,
      },
    });

    await this.prisma.fitapi_passwordresettoken.update({
      where: { id: tokenRecord.id },
      data: {
        is_used: true,
      },
    });

    return {
      message: 'password reset successfully',
    };
  }

  async createToken(data: any) {
    const accessToken = this.jwtService.sign({
      user_id: data.user_id,
    }, { expiresIn: '15m' });

    const refreshToken = this.jwtService.sign({
      user_id: data.user_id,
    }, { expiresIn: '7d' });
    return {accessToken, refreshToken};
  }
}
