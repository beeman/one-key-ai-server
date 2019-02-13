import { Module } from '@nestjs/common';
import { ProcessService } from './process/process.service';

@Module({
    providers: [ProcessService],
})
export class CoreModule { }
