import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prismaService: PrismaService) { }

    async createAuditLog(data: {
        action: string;
        user_id: string;
        performedBy: string;
        metadata?: any,
        status: string
    }) {
        const changeMessage = JSON.stringify({
            action: data.action,
            status: data.status,
            metadata: data.metadata || {}
        });

        return await this.prismaService.django_admin_log.create({
            data: {
                action_time: new Date(),
                object_repr: data.performedBy,
                action_flag: 1, // Defaulting to 1 for addition/action
                change_message: changeMessage,
                user_id: data.user_id,
            }
        });
    }

    async getAuditLogs() {
        return await this.prismaService.django_admin_log.findMany({ orderBy: { action_time: 'desc' } })

    }
}