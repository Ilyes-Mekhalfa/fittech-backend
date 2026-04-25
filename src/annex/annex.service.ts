import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto';
@Injectable()
export class AnnexService {
  constructor(private prisma: PrismaService) {}
  async findAnnex(email: string) {
    return await this.prisma.fitapi_user.findFirst({
      where: {
        email,
      },
    });
  }

  async createAnnex(data: any) {
    return await this.prisma.fitapi_user.create({
      data,
    });
  }

  async updateAnnex(id: string, data: any) {
    //check if the annex exists
    const exists = await this.prisma.fitapi_user.findUnique({
      where: {
        id,
      },
    });

    if (!exists) {
      throw new BadRequestException('Annex does not exists');
    }
    //validate data to be done later
    return await this.prisma.fitapi_user.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteAnnex(id: string) {
    //check if the annex exists
    const exists = await this.prisma.fitapi_user.findUnique({
      where: {
        id,
      },
    });

    if (!exists) {
      throw new BadRequestException('Annex does not exists');
    }
    return await this.prisma.fitapi_user.delete({
      where: {
        id,
      },
    });
  }
  // async createResetToken(id: string) {
  //   const resetToken = crypto.randomBytes(32).toString('hex');
  //   await this.prisma.fitapi_user.update({
  //     where: { id },
  //     data: {
  //       resetToken,
  //       resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
  //     },
  //   });

  //   return resetToken;
  // }

  // async findResetTokenAnnex(resetToken: string) {
  //   return await this.prisma.fitapi_user.findFirst({
  //     where: {
  //       resetToken,
  //       resetTokenExpiry: {
  //         gt: new Date(),
  //       },
  //     },
  //   });
  // }

  async findAnnexByCode(id: string) {
    return await this.prisma.fitapi_user.findUnique({
      where: {
        id,
      },
    });
  }
}
