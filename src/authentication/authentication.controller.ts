import { Controller } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  async login(@Body() body: loginDTO) {
    return await this.authenticationService.login(body);
  }

  @Post('registerAnnex')
  async register(@Body() body: any) {
    // return await this.authenticationService.register(body);
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
  async logout() {
    //clear the cookies
  }
}
