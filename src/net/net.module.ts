import { Module } from '@nestjs/common';
import { PerformanceService } from './performance/performance.service';
import { PerformanceGateway } from './performance/performance.gateway';
import { DriverService } from './driver/driver.service';
import { DriverGateway } from './driver/driver.gateway';
import { ProcessService } from 'src/core/process/process.service';
import { DockerGateway } from './docker/docker.gateway';
import { DockerService } from './docker/docker.service';
import { TerminalsController } from './terminals/terminals.controller';

@Module({
  controllers: [TerminalsController],
  providers: [
    PerformanceService,
    PerformanceGateway,
    DriverService,
    DriverGateway,
    ProcessService,
    DockerGateway,
    DockerService,
    ],
})
export class NetModule { }
