import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AnnexService } from 'src/annex/annex.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private annexService: AnnexService,
  ) {
    const jwtSecret = configService.get<string>('ACCESS_TOKEN');
    if (!jwtSecret) {
      throw new Error(
        'JwtStrategy requires Jwt secret (JWT_SECRET or JWT_TOKEN)',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          console.log(req?.cookies);
          
          return req?.cookies?.access_token || null;
        },
      ]),
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('JWT payload:', payload);
    const annex = await this.annexService.findAnnexByCode(payload.annexCode);
    console.log('Found annex:', annex);
    return annex;
  }
}
