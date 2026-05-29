import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class MachineService {
  constructor(private prismaService: PrismaService) {}

  async getAllMachines() {
    return await this.prismaService.fitapi_machine.findMany();
  }

  async getMachine(id: string) {
    return await this.prismaService.fitapi_machine.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async addMachine(machine: any) {
    return await this.prismaService.fitapi_machine.create({
      data: {
        ...machine,
      },
    });
  }

  async updateMachine(id: string, updateData: any) {
    await this.prismaService.fitapi_machine.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return await this.prismaService.fitapi_machine.update({
      where: {
        id,
      },
      data: {
        ...updateData,
      },
    });
  }

  async deleteMachine(id: string) {
    return await this.prismaService.fitapi_machine.delete({
      where: {
        id,
      },
    });
  }
}
