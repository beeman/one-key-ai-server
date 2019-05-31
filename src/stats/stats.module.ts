import { Module } from '@nestjs/common';
import { NvidiaService } from './services/nvidia.service';
import { CoreModule } from '../core/core.module';
import { ComputerStatsService } from './services/computer-stats.service';

@Module({
  imports: [CoreModule],
  providers: [NvidiaService, ComputerStatsService]
})
export class StatsModule { }
