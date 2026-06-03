import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // 1. Import your WebSockets Gateway

@Injectable()
export class PlanService {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway, // 2. Inject your real-time messaging gateway
  ) {}

  async getAllPlans() {
    return await this.prismaService.fitapi_subscriptionplan.findMany();
  }

  async getPlan(id: string) {
    return await this.prismaService.fitapi_subscriptionplan.findUnique({
      where: { id },
    });
  }

  async addPlan(body: any) {
    const newPlan = await this.prismaService.fitapi_subscriptionplan.create({
      data: { ...body, id: randomUUID(), created_at: new Date() },
    });

    // 3. Broadcast addition to update landing grids and pricing boards instantly
    this.socketGateway.server.emit('plan_added', newPlan);

    return newPlan;
  }

  async updatePlan(id: string, body: any) {
    const updatedPlan = await this.prismaService.fitapi_subscriptionplan.update(
      {
        where: { id },
        data: body,
      },
    );

    // 4. Broadcast updates so open checkout cards or plan tables refresh live
    this.socketGateway.server.emit('plan_updated', updatedPlan);

    return updatedPlan;
  }

  async deletePlan(id: string) {
    const deletedPlan = await this.prismaService.fitapi_subscriptionplan.delete(
      {
        where: { id },
      },
    );

    // 5. Emit removal notice to pull the plan card off the screen live
    this.socketGateway.server.emit('plan_deleted', { id });

    return deletedPlan;
  }
}
