import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
@Injectable()
export class AnnexService {
  constructor(private prisma: PrismaService) {}
  async findAnnex(email: string) {
    return await this.prisma.annexManager.findFirst({
      where: {
        email,
      },
    });
  }

  async createAnnex(data: any) {
    return await this.prisma.annexManager.create({
      data,
    });
  }

  async updateAnnex(annexCode: string, data: any) {
    return await this.prisma.annexManager.update({
      where: {
        annexCode,
      },
      data,
    });
  }

  async createResetToken(annexCode: string) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.annexManager.update({
      where: { annexCode },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return resetToken;
  }

  async findResetTokenAnnex(resetToken: string) {
    return await this.prisma.annexManager.findFirst({
      where: {
        resetToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });
  }

  async findAnnexByCode(annexCode: string) {
    return await this.prisma.annexManager.findUnique({
      where: {
        annexCode,
      },
    });
  }
}
