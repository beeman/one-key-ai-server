import { Module } from '@nestjs/common';
import { ProcessService } from './process/process.service';
import { FileService } from './file.service';

@Module({
    providers: [ProcessService, FileService],
    exports: [FileService]
})
export class CoreModule { }
