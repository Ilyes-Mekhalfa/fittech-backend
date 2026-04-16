import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('ACCESS_TOKEN');
    if (!jwtSecret) {
      throw new Error(
        'JwtStrategy requires Jwt secret (JWT_SECRET or JWT_TOKEN)',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.cookies?.access_token || null;
        },
      ]),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      annexCode: payload.annexCode,
      annexName: payload.annexName,
    };
  }
}
