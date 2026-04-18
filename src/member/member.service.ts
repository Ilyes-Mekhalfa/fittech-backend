import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MemberService {

    constructor(private prismaService: PrismaService){}

    async addMember(body: any){
        return await this.prismaService.fitapi_membre.create({
            data: {
                ...body
            }
        })
    }

    async getAllMembers(){
        return await this.prismaService.fitapi_membre.findMany()
    }

    async getMember(id: any){
        return await this.prismaService.fitapi_membre.findUnique({
            where: {
                id
            }
        })
    }

    async updateMember(id: any, body: any){
        return await this.prismaService.fitapi_membre.update({
            where: {
                id
            },
            data: {
                ...body
            }
        })
    }

    async deleteMember(id: any){
        return await this.prismaService.fitapi_membre.delete({
            where: {
                id
            }
        })
    }
}
