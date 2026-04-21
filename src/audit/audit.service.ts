import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prismaService: PrismaService) { }

    async createAuditLog(data: {
        action: "USER_ARCHIVED" | "PAYMENT_RECIVED";
        user_id: string;
        performedBy: "SYSTEM" | "ADMIN";
        metadata?: any,
        status: "SUCCESS" | "FAIL"
    }) {
        return await this.prismaService.django_admin_log.create({
            data:{
                ...data
            }
        });
    }

    async getAuditLogs() {
        return await this.prismaService.django_admin_log.findMany({ orderBy: { action_time: 'desc' } })

    }
}