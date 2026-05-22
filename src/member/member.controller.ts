import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { MemberService } from './member.service';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Post('add')
  async addMember(@Body() body: any) {
    return await this.memberService.addMember(body);
  }

  @Get('allMembers')
  async getAllMember() {
    return await this.memberService.getAllMembers();
  }

  @Get(':id')
  async getMember(@Param('id') id: any) {
    return await this.memberService.getMember(id);
  }

  @Patch('updateMember/:id')
  async updateMember(@Param('id') id: any, @Body() body: any) {
    return await this.memberService.updateMember(id, body);
  }

  @Patch('archiveMember/:id')
  async archiveMember(@Param('id') id: any) {
    return await this.memberService.archiveMember(id);
  }

  @Delete('deleteMember/:id')
  async deleteMember(@Param('id') id: any) {
    return await this.memberService.deleteMember(id);
  }
}
