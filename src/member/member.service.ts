import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'node:crypto';
@Injectable()
export class MemberService {

    constructor(private prismaService: PrismaService) { }

    async addMember(body: any) {
        const data = body
        //check if the user exists
        const exists = await this.prismaService.fitapi_user.findUnique({
            where: {
                email: data.email
            }
        })
        if(exists){
            throw new BadRequestException('mamber exists already')
        }

        //validate Data
        //to be done later

        //create member
        const user =await this.prismaService.fitapi_user.create({
            data: {
                id: randomUUID(),
                email: data.email,
                password: data.password,
                first_name: data.first_name,
                last_name: data.last_name,
                role: 'Member',
                phone: data.phone,
                is_active: true,
                created_at: new Date(),
                is_superuser: false,
                is_staff: false,
            },
            select: {
                id: true
            }
        })
        return await this.prismaService.fitapi_membre.create({
            data: {
                id: randomUUID(),
                join_date: new Date(),
                user_id: user.id,
                date_of_birth: data.date_of_birth,
                health_goal: data.health_goal,
                medical_restrictions: data.medical_restrictions,
            },
            omit: {
                user_id: true
            },
            include: {
                fitapi_user: {
                    omit: {
                        password: true,
                        is_active: true,
                        created_at: true,
                        last_login: true,
                        role: true

                    }
                }
            }
        })
    }

    async getAllMembers() {
        return await this.prismaService.fitapi_membre.findMany({
            omit: {
                user_id: true
            },
            include: {
                fitapi_user: {
                    omit: {
                        password: true,
                        is_active: true,
                        last_login: true,
                        role: true

                    }
                }
            }
    })
    }

    async getMember(id: any) {
        return await this.prismaService.fitapi_membre.findUnique({
            where: {
                id
            },
            omit: {
                user_id: true
            },
            include: {
                fitapi_user: {
                    omit: {
                        password: true,
                        is_active: true,
                        created_at: true,
                        last_login: true,
                        role: true

                    }
                }
            }
        })
    }

    async updateMember(id: any, body: any) {
        return await this.prismaService.fitapi_user.update({
            where: {
                id
            },
            data: {
                ...body
            }
        })
    }

    async archiveMember(id: any){
        // await this.prismaService.fitapi_user.update({
        //     where: {
        //         id
        //     },
        //     data: {
        //         is_active: false,
        //     }
        // })

        // return await this.prismaService.fitapi_archive.create({
        //     data: {
        //         user_id: id,
                
        //     }
        // })

    }
    async deleteMember(id: any) {

        //check if the member exists
        const user_id =  await this.prismaService.fitapi_membre.findUnique({
            where: {
                id
            },
            select: {
                user_id: true
            }
        })
        
        if(!user_id){
            throw new BadRequestException('user doe not exists')
        }
 
        //delete member
        await this.prismaService.fitapi_membre.delete({
            where: {
                id
            }
        })

        // await this.prismaService.fitapi_membresubscription.delete({
        //     where: {
        //         id
        //     }
        // })

        // await this.prismaService.fitapi_user_groups.deleteMany({
        //     where: {
        //         user_id: user_id?.user_id
        //     }
        // })

        //delete token
        // await this.prismaService.token_blacklist_blacklistedtoken.deleteMany({
        //     where: {
        //         user_id: user_id?.user_id
        //     }
        // })
        // await this.prismaService.token_blacklist_outstandingtoken.deleteMany({
        //     where: {
        //         user_id: user_id?.user_id
        //     }
        // })

        //delete user
        await this.prismaService.fitapi_user.delete({
            where: {
                id: user_id?.user_id
            }
        })

        return true
    }
}
