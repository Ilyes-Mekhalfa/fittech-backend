import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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

  // async createAnnex(data: any) {
  //   return await this.prisma.annexManager.create({
  //     data: {
  //       annexName: data.annexName,
  //     },
  //   });
  // }

  // async updateAnnex(data: any, annexCode: string) {
  //   return await this.prisma.annexManager.update({
  //     where: {
  //       annexCode,
  //     },
  //     data: {
  //       annexName: data.annexName,
  //     },
  //   });
  // }
}
