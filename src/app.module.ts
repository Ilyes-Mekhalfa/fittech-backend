import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AdminModule } from './admin/admin.module';
import { AnnexModule } from './annex/annex.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { EmailService } from './mail/mail.service';
import { CoachModule } from './coach/coach.module';
import { MemberModule } from './member/member.module';
import { AuditService } from './audit/audit.service';
import { AuditModule } from './audit/audit.module';
import { PlanService } from './plan/plan.service';
import { PlanModule } from './plan/plan.module';
import { MachineModule } from './machine/machine.module';
import { LandingModule } from './landing/landing.module';
import { SocketModule } from './socket/socket.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import redisConfig from './config/redis.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ── Core config ────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [redisConfig],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 5,
      },
    ]),

    // ── 3. BullMQ (background jobs) ─────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('redis.host'),
          port: config.get<number>('redis.port'),
          ...(config.get('redis.password') && {
            password: config.get('redis.password'),
          }),
        },
      }),
    }),
    AuthenticationModule,
    AnnexModule,
    PrismaModule,
    AdminModule,
    MailModule,
    CoachModule,
    MemberModule,
    AuditModule,
    PlanModule,
    MachineModule,
    LandingModule,
    SocketModule,
    DashboardModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EmailService,
    AuditService,
    PlanService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
