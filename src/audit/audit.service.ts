// audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prismaService: PrismaService) { }

    async createAuditLog(data: {
        action: string;
        targetId: string;
        performedBy: string;
        metaData?:any
    }) {
        return await this.prismaService.audit_log.create({
            ...data,
            metaData: JSON.stringify(data.metaData),
            createdAt: new Date(),
        });
    }

    async getAuditLogs() {
        return await this.prismaService.audit_log.findMany({ order: { createdAt: 'DESC' } })

    }
}