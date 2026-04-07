import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AnnexService {
  constructor(private prisma: PrismaService) {}
  async findAnnex(annexId: any) {
    return await this.prisma.annex.findUnique({
      where: {
        id: annexId,
      },
    });
  }

  async createAnnex(data: any) {
    return await this.prisma.annex.create({
      data: {
        annexName: data.annexName,
        annexId: data.annexId,
      },
    });
  }
}
