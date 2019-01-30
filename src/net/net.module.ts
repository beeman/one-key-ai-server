import { Module } from '@nestjs/common';
import { PerformanceService } from './performance/performance.service';
import { PerformanceGateway } from './performance/performance.gateway';

@Module({
  controllers: [],
  providers: [PerformanceService, PerformanceGateway]
})
export class NetModule { }
