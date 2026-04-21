import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CoachService {

    constructor(private prismaService: PrismaService) { }

    async addCoach(body: any) {
        const data = body;
        //check if the coach exists already
        const exists = await this.prismaService.fitapi_user.findUnique({
            where: {
                email: data.email
            }
        })

        if (exists) {
            throw new BadRequestException('coach exists already please try to login')
        }

        //data validation
        //to be added later
        //add the user to the db
        const user = await this.prismaService.fitapi_user.create({
            data: {
                id: randomUUID(),
                email: data.email,
                password: data.password,
                first_name: data.first_name,
                last_name: data.last_name,
                role: 'COACH',
                phone: data.phone,
                is_active: true,
                created_at: new Date()
            },
            select: {
                id: true
            }
        })


        //add the coach to the db
        const coach = await this.prismaService.fitapi_coach.create({
            data: {
                id: randomUUID(),
                user_id: user.id,
                specialties: data.specialties,
                biography: data.biography,
                years_of_experience: data.years_of_experience,
                is_active: true
            },
            omit: {
                user_id: true,
                is_active: true
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

        return coach
    }

    async getAllCoach() {
        return await this.prismaService.fitapi_coach.findMany({
            omit: {
                user_id: true,
                is_active: true
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

    async getCoach(id: any) {

        //check if the coach exists
        return await this.prismaService.fitapi_coach.findUniqueOrThrow({
            where: {
                id
            },
            omit: {
                user_id: true,
                is_active: true
            },
            include: {
                fitapi_user: {
                    omit: {
                        password: true,
                        is_active: true,
                        created_at: true,
                        last_login: true,
                        role: true,
                    }
                }
            }
        })
    }

    async updateCoach(id: any, body: any) {

        //check if the  user exists

        await this.prismaService.fitapi_coach.findUniqueOrThrow({
            where: {
                id
            }
        })

        return await this.prismaService.fitapi_user.update({
            where: {
                id
            },
            data: {
                ...body
            }
        })
    }

    async deleteCoach(id: any) {
        return await this.prismaService.fitapi_coach.delete({
            where: {
                id
            }
        })
    }
}
