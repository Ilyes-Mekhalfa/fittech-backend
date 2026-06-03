import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // 1. Import your WebSockets Gateway
import { randomUUID } from 'node:crypto';

@Injectable()
export class MachineService {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway // 2. Inject your real-time messaging gateway
  ) {}

  async getAllMachines() {
    return await this.prismaService.fitapi_machine.findMany();
  }

  async getMachine(id: string) {
    return await this.prismaService.fitapi_machine.findUniqueOrThrow({
      where: { id },
    });
  }

  async addMachine(machine: any) {
    const newMachine = await this.prismaService.fitapi_machine.create({
      data: {
        id: randomUUID(),
        created_at: new Date(),
        ...machine,
      },
    });

    // 3. Emit addition event to update management lists
    this.socketGateway.server.emit('machine_added', newMachine);
    
    return newMachine;
  }

  async updateMachine(id: string, updateData: any) {
    await this.prismaService.fitapi_machine.findUniqueOrThrow({
      where: { id },
    });

    const updatedMachine = await this.prismaService.fitapi_machine.update({
      where: { id },
      data: {
        ...updateData,
      },
    });

    // 4. Emit modification event to update status badges or details live
    this.socketGateway.server.emit('machine_updated', updatedMachine);

    return updatedMachine;
  }

  async deleteMachine(id: string) {
    const deletedMachine = await this.prismaService.fitapi_machine.delete({
      where: { id },
    });

    // 5. Emit removal event to wipe the element from open client views
    this.socketGateway.server.emit('machine_deleted', { id });

    return deletedMachine;
  }
}