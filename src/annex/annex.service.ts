import { Injectable } from '@nestjs/common';

@Injectable()
export class AnnexService {
  constructor(private prisma: PrismaService) {}
  async findAnnex(annexId: string) {
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
        password: data.password,
      },
    });
  }
}
