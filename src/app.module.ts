import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { AnnexModule } from './annex/annex.module';

@Module({
  imports: [AuthenticationModule, UserModule, AnnexModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
