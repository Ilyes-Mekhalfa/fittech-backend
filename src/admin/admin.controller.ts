import { Controller, UseGuards,Delete,  Get, Patch, Param } from '@nestjs/common';
import { Role } from 'src/common/decorators/role.decorator';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';

@Controller('admin')
export class AdminController {

    constructor(private adminService: AdminService){}

    @Get('audit-logs')
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async getAuditLogs(){
        return await this.adminService.getAuditLogs()
    }

    @Get('active-users')
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async getActiveUsers(){
        return await this.adminService.getActiveUsers()
    }

    @Get('archived-users')
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async getArchivedUsers(){
        return await this.adminService.getArchivedUsers()
    }
    

    @Patch('/archive/:id')
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async archiveUser(@Param('id') id: any){
        return await this.adminService.archiveUser(id)
    }

    @Patch('restore/:id')
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async restoreUser(@Param('id') id: any){
        return await this.adminService.restoreUser(id)
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @Role('ADMIN')
    async deleteUser(@Param('id') id: any){
        return await this.adminService.deleteUser(id)
    }
}
