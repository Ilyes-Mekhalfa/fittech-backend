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
  async register(@Body() body: any){
    // return await this.authenticationService.register(body);
  }

  @Post('logout')
  async logout(){
    return 1;
  }
}
