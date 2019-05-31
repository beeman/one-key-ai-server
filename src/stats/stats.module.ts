import { Module } from '@nestjs/common';
import { NvidiaService } from './services/nvidia.service';
import { CoreModule } from '../core/core.module';

@Module({
  imports: [CoreModule],
  providers: [NvidiaService]
})
export class StatsModule { }
