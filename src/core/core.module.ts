import { Module } from '@nestjs/common';
import { ProcessService } from './process/process.service';
import { FileService } from './file.service';
import { ConfigService } from './config.service';

@Module({
    providers: [ProcessService, FileService, ConfigService],
    exports: [ProcessService, FileService, ConfigService]
})
export class CoreModule { }
