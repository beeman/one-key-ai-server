import { Module } from '@nestjs/common';
import { PerformanceService } from './performance/performance.service';
import { PerformanceGateway } from './performance/performance.gateway';
import { DriverService } from './driver/driver.service';
import { DriverGateway } from './driver/driver.gateway';
import { ProcessService } from 'src/core/process/process.service';

@Module({
  controllers: [],
  providers: [PerformanceService, PerformanceGateway, DriverService, DriverGateway, ProcessService]
})
export class NetModule { }
