import { Module } from '@nestjs/common';
import { PerformanceService } from './performance/performance.service';
import { PerformanceGateway } from './performance/performance.gateway';
import { DriverController } from './driver/driver.controller';
import { DriverService } from './driver/driver.service';
import { DriverGateway } from './driver/driver.gateway';

@Module({
  controllers: [DriverController],
  providers: [PerformanceService, PerformanceGateway, DriverService, DriverGateway]
})
export class NetModule { }
