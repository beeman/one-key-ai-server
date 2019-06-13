import { Module } from '@nestjs/common';
import { DriverService } from './info/driver.service';
import { ProcessService } from '../core/process.service';
import { InfoController } from './info/info.controller';
import { TerminalService } from './terminals/terminal.service';

@Module({
  controllers: [InfoController],
  providers: [
    DriverService,
    ProcessService,
    TerminalService,
  ],
})
export class NetModule { }
