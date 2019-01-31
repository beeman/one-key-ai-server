import { Controller, Get, Logger } from '@nestjs/common';
import { DriverService } from './driver.service';
import { map } from 'rxjs/operators';

@Controller('driver')
export class DriverController {
    private readonly tag = DriverController.name;

    constructor(private readonly driverService: DriverService) { }

    @Get('list')
    async list() {
        const result = await this.driverService.getList();
        return { data: result };
    }

    @Get('devices')
    async devices() {
        const result = await this.driverService.getDevices();
        return { data: result };
    }
}
