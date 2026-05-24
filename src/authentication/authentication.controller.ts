import { Controller } from '@nestjs/common';
import { Post, Res, Body, Query } from '@nestjs/common';
import { loginDTO, resetPasswordDTO } from './dto/authentication.dto';
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
    //adding cookies to the response
    const data = await this.authenticationService.login(body);
    // res.cookie('access_token', data.accessToken, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: 'strict',
    // });

    return { annex: data.annex };
  }

  @Post('registerAnnex')
  async register(@Body() body: any, @Res({passthrough: true}) res: Response) {
    const data =await this.authenticationService.register(body)
    // res.cookie('access_token', data.accessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: 'strict',
    // });
    return data;
  }

  // @Post('forgetPassword')
  // async forgetPassword(@Body() body: any) {
  //   return this.authenticationService.forgetPassword(body);
  // }

  // @Post('resetPassword')
  // async resetPassword(
  //   @Body() body: any,
  //   @Query('reset_token') resetToken: string,
  // ) {
  //   const data: resetPasswordDTO = { ...body, resetToken };
  //   return this.authenticationService.resetPassword(data);
  // }

  // @Post('logout')
  // async logout() {
  //   //clear the cookies
  // }
}
