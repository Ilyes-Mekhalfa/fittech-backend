import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CoachService {
  constructor(private prismaService: PrismaService) {}

  async addCoach(body: any) {
    const data = body;
    //check if the coach exists already
    const exists = await this.prismaService.fitapi_user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (exists) {
      throw new BadRequestException('coach exists already please try to login');
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
        is_online: false,
        created_at: new Date(),
        is_superuser: false,
        is_staff: false,
      },
      select: {
        id: true,
      },
    });

    //add the coach to the db
    const coach = await this.prismaService.fitapi_coach.create({
      data: {
        id: randomUUID(),
        user_id: user.id,
        specialties: data.specialties,
        biography: data.biography,
        years_of_experience: data.years_of_experience,
        is_active: true,
      },
      omit: {
        user_id: true,
        is_active: true,
      },
      include: {
        fitapi_user: {
          omit: {
            password: true,
            is_active: true,
            created_at: true,
            last_login: true,
            role: true,
          },
        },
      },
    });

    return coach;
  }

  async getAllCoach() {
    const coaches = await this.prismaService.fitapi_user.findMany({
      where: {
        is_active: true,
        role: { in: ['COACH', 'coach'] },
      },
      omit: {
        password: true,
        is_active: true,
        created_at: true,
        last_login: true,
        role: true,
      },
      include: {
        fitapi_coach: {
          omit: {
            user_id: true,
          },
        },
      },
    });

    const pendingRequests = await this.prismaService.fitapi_user.findMany({
      where: {
        archived_at: null,
        is_active: false,
        role: { in: ['COACH', 'coach'] },
      },
      omit: {
        password: true,
        is_active: true,
        last_login: true,
      },
      include: {
        fitapi_coach: {
          select: {
            specialties: true,
            id: true,
          },
        },
      },
    });
    return { coaches, pendingRequests };
  }

  async getCoach(id: string) {
    //check if the coach exists
    return await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: {
        id,
      },
      omit: {
        user_id: true,
        is_active: true,
      },
      include: {
        fitapi_user: {
          omit: {
            password: true,
            is_active: true,
            created_at: true,
            last_login: true,
            role: true,
          },
        },
      },
    });
  }

  async updateCoach(id: string, body: any) {
    //check if the  user exists

    await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return await this.prismaService.fitapi_coach.update({
      where: {
        id,
      },
      data: {
        specialties: body.specialties,
        biography: body.biography,
        fitapi_user: {
          update: {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            is_active: body.is_active,
          },
        },
      },
    });
  }

  async archiveCoach(id: string) {
    //check if the user exists
    await this.prismaService.fitapi_user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    return this.prismaService.fitapi_user.update({
      where: {
        id,
      },
      data: {
        is_active: false,
        archived_at: new Date(),
      },
    });
  }

  async deleteCoach(id: string) {
    const user = await this.prismaService.fitapi_user.findUnique({
      where: {
        id,
      },
      include: {
        fitapi_coach: true,
      },
    });

    const coachId = user?.fitapi_coach?.id;

    //delete coach related documents
    await this.prismaService.fitapi_coachcertificate.deleteMany({
      where: {
        coach_id: coachId,
      },
    });

    await this.prismaService.fitapi_coachreview.deleteMany({
      where: {
        coach_id: coachId,
      },
    });

    await this.prismaService.fitapi_conversation.deleteMany({
      where: {
        coach_id: coachId,
      },
    });

    await this.prismaService.fitapi_course.deleteMany({
      where: {
        coach_id: coachId,
      },
    });

    //delete the coach document
    await this.prismaService.fitapi_coach.delete({
      where: {
        id: coachId,
      },
    });

    await this.prismaService.fitapi_user.delete({
      where: {
        id,
      },
    });
  }

  async addNewCourse(coachId: string, body: any) {
    //check if coach exists
    await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: {
        id: coachId,
      },
    });
    console.log(body);
    return await this.prismaService.fitapi_course.create({
      data: {
        id: randomUUID(),
        coach_id: coachId,
        title: body.title,
        description: body.description,
        max_participants: body.maxParticipants,
        duration_minutes: body.duration,
        level_required: body.level_required,
        created_at: new Date(),
        date_time: new Date(body.date).toISOString(),
      },
    });
  }
}
