import { Controller, Get, Param, Post, Body, Patch, Delete } from '@nestjs/common';
import { PlanService } from './plan.service';
@Controller('plan')
export class PlanController {

    constructor(private planService: PlanService){}

    @Get('/allPlans')
    getAllPlans(){
        return this.planService.getAllPlans();
    }

    @Get('/:id')
    getPlan(@Param('id') id: string){
        return this.planService.getPlan(id);
    }

    @Post('/add')
    addPlan(@Body() body:any) {
        return this.planService.addPlan(body)
    }

    @Patch(':id')
    async updatePlan(@Param('id') id: string, @Body() body: any){
        return this.planService.updatePlan(id, body)
    }

    @Delete(':id')
    async deletePlan(@Param('id') id: string){
        return this.planService.deletePlan(id)
    }
}
