import { Module } from '@nestjs/common';
import { DriverService } from './info/driver/driver.service';
import { ProcessService } from '../core/process/process.service';
import { TerminalsController } from './terminals/terminals.controller';
import { InfoController } from './info/info.controller';

@Module({
  controllers: [TerminalsController, InfoController],
  providers: [
    DriverService,
    ProcessService,
    ],
})
export class NetModule { }
