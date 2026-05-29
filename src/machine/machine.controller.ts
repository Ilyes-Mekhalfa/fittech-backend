import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { MachineService } from './machine.service';

@Controller('machine')
export class MachineController {
  constructor(private machineService: MachineService) {}

  @Get('')
  async getAllMachines() {
    return await this.machineService.getAllMachines();
  }

  @Get(':id')
  async getMachine(@Param('id') id: string) {
    return await this.machineService.getMachine(id);
  }

  @Post('')
  async addMachine(@Body() machine: any) {
    return await this.machineService.addMachine(machine);
  }

  @Patch(':id')
  async updateMachine(@Param('id') id: string, @Body() updateData: any) {
    return await this.machineService.updateMachine(id, updateData);
  }

  @Delete(':id')
  async deleteMachine(@Param('id') id: string) {
    return await this.machineService.deleteMachine(id);
  }
}
