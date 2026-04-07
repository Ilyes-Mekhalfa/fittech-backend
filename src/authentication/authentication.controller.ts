import { Controller } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { loginDTO } from './dto/authentication.dto';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post('login')
  async login(@Body() body: loginDTO) {
    return 1;
  }

  @Post('register')
  async register(@Body() body: any){
    return 1;
  }

  @Post('logout')
  async logout(){
    return 1;
  }
}
