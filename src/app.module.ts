import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AdminModule } from './admin/admin.module';
import { AnnexModule } from './annex/annex.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
  ],
  controllers: [AppController],
  providers: [AppService, EmailService, AuditService, PlanService],
})
export class AppModule {}
