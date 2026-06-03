import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // 1. Import your WebSockets Gateway

@Injectable()
export class AnnexService {
  constructor(
    private prisma: PrismaService,
    private socketGateway: SocketGateway, // 2. Inject your real-time messaging gateway
  ) {}

  async findAnnex(email: string) {
    return await this.prisma.fitapi_user.findFirst({
      where: {
        email,
      },
    });
  }

  async createAnnex(data: any) {
    const newAnnex = await this.prisma.fitapi_user.create({
      data,
    });

    // 3. Emit real-time addition event so admin tables append the row instantly
    this.socketGateway.server.emit('annex_added', newAnnex);

    return newAnnex;
  }

  async updateAnnex(id: string, data: any) {
    // Check if the annex exists
    const exists = await this.prisma.fitapi_user.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new BadRequestException('Annex does not exist');
    }

    // Validate data to be done later
    const updatedAnnex = await this.prisma.fitapi_user.update({
      where: { id },
      data,
    });

    // 4. Emit update event to sync open profile sheets or list rows
    this.socketGateway.server.emit('annex_updated', updatedAnnex);

    return updatedAnnex;
  }

  async deleteAnnex(id: string) {
    // Check if the annex exists
    const exists = await this.prisma.fitapi_user.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new BadRequestException('Annex does not exist');
    }

    await this.prisma.fitapi_user.delete({
      where: { id },
    });

    // 5. Emit removal event to clear out the UI entries live
    this.socketGateway.server.emit('annex_deleted', { id });

    return { id, message: 'Annex deleted successfully' };
  }

  async findAnnexByCode(id: string) {
    return await this.prisma.fitapi_user.findUnique({
      where: { id },
    });
  }
}