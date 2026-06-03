import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocketGateway } from 'src/socket/socket.gateway'; // 1. Import your WebSockets Gateway
import { randomUUID } from 'crypto';

@Injectable()
export class CoachService {
  constructor(
    private prismaService: PrismaService,
    private socketGateway: SocketGateway // 2. Inject your real-time messaging gateway
  ) {}

  async addCoach(body: any) {
    const data = body;
    // Check if the coach exists already
    const exists = await this.prismaService.fitapi_user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (exists) {
      throw new BadRequestException('coach exists already please try to login');
    }

    // Add the user to the db
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

    // Add the coach to the db
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

    // 3. Emit real-time notification to the admin panels monitoring applications
    this.socketGateway.server.emit('coach_added', coach);

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
          include: {
            fitapi_coachreview: {
              select: {
                rating: true,
              },
            },
            fitapi_course: true,
            fitapi_coachcertificate: true,
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
    return await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: { id },
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
    await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: { id },
    });

    const updatedCoach = await this.prismaService.fitapi_coach.update({
      where: { id },
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
      include: {
        fitapi_user: true
      }
    });

    // 4. Emit update event to the coach list components
    this.socketGateway.server.emit('coach_updated', updatedCoach);

    // 5. If an admin flips a pending coach to active, broadcast approval to the landing page!
    if (body.is_active === true) {
      this.socketGateway.server.emit('coach_approved', {
        id: updatedCoach.id,
        approvedCoach: {
          name: `${updatedCoach.fitapi_user.first_name} ${updatedCoach.fitapi_user.last_name}`,
          specialty: updatedCoach.specialties?.[0] || 'Fitness',
          rating: 5.0,
          image: 'assets/coaches/coach-default.jpg' // Fallback placeholder
        }
      });
    }

    return updatedCoach;
  }

  async archiveCoach(id: string) {
    await this.prismaService.fitapi_user.findUniqueOrThrow({
      where: { id },
    });

    const archivedUser = await this.prismaService.fitapi_user.update({
      where: { id },
      data: {
        is_active: false,
        archived_at: new Date(),
      },
    });

    // 6. Emit deletion event to clear it from the landing and dashboard lists
    this.socketGateway.server.emit('coach_deleted', { id });

    return archivedUser;
  }

  async deleteCoach(id: string) {
    const user = await this.prismaService.fitapi_user.findUnique({
      where: { id },
      include: {
        fitapi_coach: true,
      },
    });

    const coachId = user?.fitapi_coach?.id;

    if (coachId) {
      // Delete coach sub-structures
      await this.prismaService.fitapi_coachcertificate.deleteMany({ where: { coach_id: coachId } });
      await this.prismaService.fitapi_coachreview.deleteMany({ where: { coach_id: coachId } });
      await this.prismaService.fitapi_conversation.deleteMany({ where: { coach_id: coachId } });
      await this.prismaService.fitapi_course.deleteMany({ where: { coach_id: coachId } });

      // Delete the core coach record
      await this.prismaService.fitapi_coach.delete({ where: { id: coachId } });
    }

    await this.prismaService.fitapi_user.delete({ where: { id } });

    // 7. Clear the item completely from all active UI interfaces
    this.socketGateway.server.emit('coach_deleted', { id });
  }

  async addNewCourse(coachId: string, body: any) {
    await this.prismaService.fitapi_coach.findUniqueOrThrow({
      where: { id: coachId },
    });
    
    const newCourse = await this.prismaService.fitapi_course.create({
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

    // 8. Real-time update for class schedules/calendars
    this.socketGateway.server.emit('course_added', newCourse);

    return newCourse;
  }
}