import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AnnexService } from 'src/annex/annex.service';
import { EmailService } from 'src/mail/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtSecret = config.get<string>('ACCESS_TOKEN');
        console.log('JWT Secret loaded:', jwtSecret ? 'YES' : 'NO', jwtSecret);
        if (!jwtSecret) {
          throw new Error('JWT secret is not configured (ACCESS_TOKEN)');
        }
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: config.get<number>('JWT_EXPIRES_IN') || 3600,
          },
        };
      },
    }),
  ],
  providers: [
    AuthenticationService,
    PrismaService,
    AnnexService,
    EmailService,
    ConfigService,
    JwtStrategy,
    JwtService,
  ],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
