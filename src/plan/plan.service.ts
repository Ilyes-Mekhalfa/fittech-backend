import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlanService {

    constructor(private prismaService: PrismaService) { }

    async getAllPlans() {
        return await this.prismaService.fitapi_subscriptionplan.findMany()
    }

    async getPlan(id: string) {
        return await this.prismaService.fitapi_subscriptionplan.findUnique({
            where: { id }
        })
    }

    async addPlan(body: any) {
        return await this.prismaService.fitapi_subscriptionplan.create({
            data: { ...body, id: randomUUID(), created_at: new Date() }
        })
    }

    async updatePlan(id: string, body: any) {
        return await this.prismaService.fitapi_subscriptionplan.update({
            where: { id },
            data: body
        })
    }

    async deletePlan(id: string) {
        return await this.prismaService.fitapi_subscriptionplan.delete({
            where: { id }
        })
    }
}
