import { Controller } from '@nestjs/common';
import {POST, Body} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {

    constructor( private authenticationService : AuthenticationService){}

    @POST('login')
    async login(@Body() body: loginDTO){
        
    }
}
