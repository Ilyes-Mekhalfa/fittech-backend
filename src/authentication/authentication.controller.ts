import { Controller } from '@nestjs/common';
import { Post, Res, Body } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { AuthenticationService } from './authentication.service';
import { Response } from 'express';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  async login(
    @Body() body: loginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authenticationService.login(body);
    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure: false, // Set to false for HTTP localhost development
      sameSite: 'strict',
    });

    return { annex: data.annex, accessToken: data.accessToken };
  }

  @Post('registerAnnex')
  async register(@Body() body: any, @Res({passthrough: true}) res: Response) {
    const data = await this.authenticationService.register(body);
    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      secure: false, // Set to false for HTTP localhost development
      sameSite: 'strict',
    });
    return data;
  }

  @Post('forgetPassword')
  async forgetPassword(@Body() body: any) {
    return this.authenticationService.forgetPassword(body);
  }

  @Post('resetPassword')
  async resetPassword(@Body() body: any) {
    return this.authenticationService.resetPassword(body);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
